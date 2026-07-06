"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { LeadBuying } from "@/types";
import { brand } from "@/config/brand";
import StepIndicator from "@/components/arac-sat/StepIndicator";
import Step1AracBilgileri from "@/components/arac-sat/Step1AracBilgileri";
import Step2DurumBilgileri from "@/components/arac-sat/Step2DurumBilgileri";
import Step3Fiyat from "@/components/arac-sat/Step3Fiyat";
import Step4Iletisim from "@/components/arac-sat/Step4Iletisim";

interface AracSatFormuProps {
  onAddLead?: (lead: LeadBuying) => void;
}

type Adim = 1 | 2 | 3 | 4;

export default function AracSatFormu({ onAddLead }: AracSatFormuProps) {
  const [adim, setAdim] = useState<Adim>(1);
  const [marka, setMarka] = useState("");
  const [yil, setYil] = useState<number | null>(null);
  const [model, setModel] = useState("");
  const [paket, setPaket] = useState("");
  const [yakit, setYakit] = useState("");
  const [vites, setVites] = useState("");
  const [kasa, setKasa] = useState("");
  const [km, setKm] = useState("");
  const [hasar, setHasar] = useState("");
  const [tramer, setTramer] = useState(false);
  const [adSoyad, setAdSoyad] = useState("");
  const [telefon, setTelefon] = useState("");
  const [fiyatBeklentisi, setFiyatBeklentisi] = useState("");
  const [takas, setTakas] = useState(false);
  const [ekNot, setEkNot] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [kvkk, setKvkk] = useState(false);
  const [sehir, setSehir] = useState("");
  const [ilce, setIlce] = useState("");
  const [iletisimTercihi, setIletisimTercihi] = useState<"telefon" | "whatsapp">("telefon");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = 5 - photoUrls.length;
    if (files.length > remaining) {
      setPhotoError(`En fazla ${remaining} fotoğraf daha yükleyebilirsiniz.`);
      return;
    }

    setUploadingPhotos(true);
    setPhotoError(null);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `lead-photos/${timestamp}-${safeName}`;

      const { data, error } = await supabase.storage
        .from("car-images")
        .upload(filePath, file, { upsert: false });

      if (error) {
        setPhotoError(`"${file.name}" yüklenirken hata oluştu: ${error.message}`);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from("car-images")
        .getPublicUrl(data.path);

      uploadedUrls.push(publicUrlData.publicUrl);
    }

    if (uploadedUrls.length > 0) {
      setPhotoUrls((prev) => [...prev, ...uploadedUrls]);
    }
    setUploadingPhotos(false);
  };

  const handleRemovePhoto = (url: string) => {
    setPhotoUrls((prev) => prev.filter((u) => u !== url));
  };

  const handleSubmit = async () => {
    if (!adSoyad.trim() || !telefon.trim() || !kvkk) return;
    setSubmitting(true);

    const fiyat = fiyatBeklentisi
      ? Number(fiyatBeklentisi.replace(/[^0-9]/g, ""))
      : null;

    const photoUrlsPayload = photoUrls.length > 0 ? photoUrls : null;

    // Step 1'deki opsiyonel alanlari extra_note icinde birlestir
    const step1Bilgileri = [
      paket ? `Paket / Versiyon: ${paket}` : "",
      yakit ? `Yakıt Tipi: ${yakit}` : "",
      vites ? `Vites Tipi: ${vites}` : "",
      kasa ? `Kasa Tipi: ${kasa}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    const combinedNote = [step1Bilgileri, ekNot.trim()]
      .filter(Boolean)
      .join("\n---\n");

    const { data, error: err } = await supabase
      .from("leads_buying")
      .insert({
        customer_name: adSoyad.trim(),
        phone: telefon.trim(),
        brand: marka,
        model: model,
        year: yil ?? 2020,
        expected_price: fiyat as number,
        status: "Bekliyor",
        km: km.trim() || null,
        damage_note: hasar.trim() || null,
        has_tramer: tramer,
        wants_trade: takas,
        extra_note: combinedNote || null,
        city: sehir.trim() || null,
        district: ilce.trim() || null,
        contact_preference: iletisimTercihi,
        kvkk_accepted: kvkk,
        photo_urls: photoUrlsPayload,
      })
      .select()
      .single();

    if (!err && data) {
      onAddLead?.(data as LeadBuying);
      // Email bildirimi gönder — fire-and-forget, hata olursa sessizce geç
      fetch("/api/notify-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: adSoyad.trim(),
          phone: telefon.trim(),
          brand: marka,
          model: model,
          year: yil ?? 2020,
          expected_price: fiyat as number,
          km: km.trim() || undefined,
          city: sehir.trim() || undefined,
          district: ilce.trim() || undefined,
          extra_note: combinedNote || undefined,
          contact_preference: iletisimTercihi,
          has_tramer: tramer,
          wants_trade: takas,
        }),
      }).catch(() => {});
    }

    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setAdim(1);
      setMarka(""); setYil(null); setModel("");
      setPaket(""); setYakit(""); setVites(""); setKasa("");
      setKm(""); setHasar(""); setTramer(false);
      setAdSoyad(""); setTelefon("");
      setFiyatBeklentisi(""); setTakas(false); setEkNot(""); setKvkk(false);
      setPhotoUrls([]); setPhotoError(null);
    }, 3000);
  };

  return (
    <>
      {/* ================================================================== */}
      {/*  PREMIUM BASLIK ALANI - Aracini Sat                                */}
      {/* ================================================================== */}
      <section id="arac-sat-formu" className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#111827] to-[#1a2332]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
            {/* Rozet */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {brand.city} Galeri &mdash; {brand.stockText}
            </div>

            {/* Baslik */}
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Aracınızı{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                Değerlendirelim
              </span>
            </h1>

            {/* Alt metin */}
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-300 sm:text-lg">
              Araç bilgilerinizi bırakın, {brand.shortName} alım ekibi sizinle kısa
              sürede iletişime geçsin.
            </p>


          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  SUREC KARTLARI + FORM                                              */}
      {/* ================================================================== */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* --- Sol: Surec Kartlari --- */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/0 to-emerald-500/30" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Süreç Nasıl İşler
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-emerald-500/0" />
            </div>
            <div className="space-y-3">
              {[
                {
                  adim: "1",
                  baslik: "Bilgileri Gönder",
                  aciklama: "Araç bilgilerini 4 adımda doldur, bize ulaşın.",
                },
                {
                  adim: "2",
                  baslik: "Alım Ekibi İncelesin",
                  aciklama: "Ekibimiz aracınızı piyasa ve stok durumuna göre değerlendirir.",
                },
                {
                  adim: "3",
                  baslik: "Sizi Arayalım",
                  aciklama: "En kısa sürede sizi arayıp ön değerlendirme sonucunu iletiriz.",
                },
                {
                  adim: "4",
                  baslik: "Randevu / Teklif",
                  aciklama: "Ekspertiz randevusu veya uygun teklifimizi sunarız.",
                },
              ].map((item) => (
                <div
                  key={item.adim}
                  className="group flex items-start gap-3 rounded-xl border border-gray-200/80 bg-white px-4 py-4 shadow-sm transition-all hover:border-green-200 hover:shadow-md"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111827] text-[11px] font-bold text-white">
                    {item.adim}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#111827]">{item.baslik}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                      {item.aciklama}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- Sag: Premium Form Kartı --- */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-gray-200/80 bg-white shadow-xl shadow-gray-200/50">
              {/* Form ustu */}
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#111827]">
                      Araç Bilgi Formu
                    </h2>
                    <p className="mt-0.5 text-sm text-gray-500">
                      4 adımda araç bilgilerinizi gönderin, talebiniz alım ekibimize düşsün.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form govde */}
              <div className="px-6 py-5">
                <StepIndicator adim={adim} />

                {submitted ? (
                  <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white px-6 py-12 text-center shadow-inner">
                    {/* Dekoratif arka plan isi */}
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-100/50 blur-2xl" />
                    <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-emerald-100/30 blur-xl" />

                    <div className="relative">
                      {/* Basari ikonu */}
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 shadow-lg shadow-emerald-600/30">
                        <svg
                          className="h-8 w-8 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>

                      {/* Baslik */}
                      <p className="mt-5 text-xl font-black text-emerald-900">
                        Talebiniz Alındı
                      </p>
                      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-emerald-700">
                        Ekibimiz kısa sürede sizinle iletişime geçecek.
                      </p>

                      {/* Basit loading animasyonu */}
                      <div className="mt-6 flex items-center justify-center gap-1.5">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:0ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-600 [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* ADIM 1 */}
                    {adim === 1 && (
                      <Step1AracBilgileri
                        marka={marka}
                        yil={yil}
                        model={model}
                        paket={paket}
                        yakit={yakit}
                        vites={vites}
                        kasa={kasa}
                        onMarkaChange={setMarka}
                        onYilChange={setYil}
                        onModelChange={setModel}
                        onPaketChange={setPaket}
                        onYakitChange={setYakit}
                        onVitesChange={setVites}
                        onKasaChange={setKasa}
                        onDevam={() => setAdim(2)}
                      />
                    )}

                    {/* ADIM 2 */}
                    {adim === 2 && (
                      <Step2DurumBilgileri
                        km={km}
                        hasar={hasar}
                        tramer={tramer}
                        photoUrls={photoUrls}
                        uploadingPhotos={uploadingPhotos}
                        photoError={photoError}
                        onKmChange={setKm}
                        onHasarChange={setHasar}
                        onTramerChange={setTramer}
                        onPhotoUpload={handlePhotoUpload}
                        onRemovePhoto={handleRemovePhoto}
                        onGeri={() => setAdim(1)}
                        onDevam={() => setAdim(3)}
                      />
                    )}

                    {/* ADIM 3 */}
                    {adim === 3 && (
                      <Step3Fiyat
                        fiyatBeklentisi={fiyatBeklentisi}
                        takas={takas}
                        ekNot={ekNot}
                        onFiyatBeklentisiChange={setFiyatBeklentisi}
                        onTakasChange={setTakas}
                        onEkNotChange={setEkNot}
                        onGeri={() => setAdim(2)}
                        onDevam={() => setAdim(4)}
                      />
                    )}

                    {/* ADIM 4 */}
                    {adim === 4 && (
                      <Step4Iletisim
                        adSoyad={adSoyad}
                        telefon={telefon}
                        sehir={sehir}
                        ilce={ilce}
                        iletisimTercihi={iletisimTercihi}
                        kvkk={kvkk}
                        submitting={submitting}
                        onAdSoyadChange={setAdSoyad}
                        onTelefonChange={setTelefon}
                        onSehirChange={setSehir}
                        onIlceChange={setIlce}
                        onIletisimTercihiChange={setIletisimTercihi}
                        onKvkkChange={setKvkk}
                        onGeri={() => setAdim(3)}
                        onSubmit={handleSubmit}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
