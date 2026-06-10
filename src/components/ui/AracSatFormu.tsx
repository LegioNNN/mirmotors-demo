"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { LeadBuying } from "@/types";
import StepIndicator from "@/components/arac-sat/StepIndicator";
import Step1AracBilgileri from "@/components/arac-sat/Step1AracBilgileri";
import Step2DurumBilgileri from "@/components/arac-sat/Step2DurumBilgileri";
import Step3Fiyat from "@/components/arac-sat/Step3Fiyat";
import Step4Iletisim from "@/components/arac-sat/Step4iletisim";

interface AracSatFormuProps {
  onAddLead: (lead: LeadBuying) => void;
}

type Adim = 1 | 2 | 3 | 4;

export default function AracSatFormu({ onAddLead }: AracSatFormuProps) {
  const [adim, setAdim] = useState<Adim>(1);
  const [marka, setMarka] = useState("");
  const [yil, setYil] = useState<number | null>(null);
  const [model, setModel] = useState("");
  const [km, setKm] = useState("");
  const [hasar, setHasar] = useState("");
  const [tramer, setTramer] = useState(false);
  const [adSoyad, setAdSoyad] = useState("");
  const [telefon, setTelefon] = useState("");
  const [fiyatBeklentisi, setFiyatBeklentisi] = useState("");
  const [takas, setTakas] = useState(false);
  const [ekNot, setEkNot] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [sehir, setSehir] = useState("");
  const [ilce, setIlce] = useState("");
  const [iletisimTercihi, setIletisimTercihi] = useState<"telefon" | "whatsapp">("telefon");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!adSoyad.trim() || !telefon.trim() || !kvkk) return;
    setSubmitting(true);

    const fiyat = fiyatBeklentisi
      ? Number(fiyatBeklentisi.replace(/[^0-9]/g, ""))
      : null;
    const leadId = `LEAD-${Date.now().toString(36).toUpperCase()}-001`;

    const { error: err } = await supabase.from("leads_buying").insert({
      id: leadId,
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
      extra_note: ekNot.trim() || null,
      city: sehir.trim() || null,
      district: ilce.trim() || null,
      contact_preference: iletisimTercihi,
      kvkk_accepted: kvkk,
    });

    if (!err) {
      const lead: LeadBuying = {
        id: leadId,
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
        extra_note: ekNot.trim() || null,
        city: sehir.trim() || null,
        district: ilce.trim() || null,
        contact_preference: iletisimTercihi,
        kvkk_accepted: kvkk,
      };
      onAddLead(lead);
    }

    if (!err) {
      const lead: LeadBuying = {
        id: leadId,
        customer_name: adSoyad.trim(),
        phone: telefon.trim(),
        brand: marka,
        model: model,
        year: yil ?? 2020,
        expected_price: fiyat as number,
        status: "Bekliyor",
      };
      onAddLead(lead);
    }

    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setAdim(1);
      setMarka(""); setYil(null); setModel("");
      setKm(""); setHasar(""); setTramer(false);
      setAdSoyad(""); setTelefon("");
      setFiyatBeklentisi(""); setTakas(false); setEkNot(""); setKvkk(false);
    }, 3000);
  };

  return (
    <>
      {/* ================================================================== */}
      {/*  HERO ALANI - Aracini Sat                                           */}
      {/* ================================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#111827] to-[#1a2332]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
            {/* Rozet */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-medium text-green-400 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Istanbul Galeri &mdash; 750+ Araclik Stok
            </div>

            {/* Baslik */}
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Aracinizi{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                Sancaktar&rsquo;a
              </span>{" "}
              Satin
            </h1>

            {/* Alt baslik */}
            <p className="mt-4 text-base leading-relaxed text-gray-300 sm:text-lg">
              Arac bilgilerinizi gonderin, alim ekibimiz kisa surede sizinle
              iletisime gecsin.
            </p>

            {/* Aciklama */}
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-gray-500">
              Fiyat tahmini vermiyoruz; aracinizin durumu, piyasa degeri ve stok
              ihtiyacimiza gore sizi arayip degerlendirme yapiyoruz.
            </p>

            {/* Guven rozetleri */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: "🛡️", label: "Ucretsiz On Degerlendirme" },
                { icon: "⚡", label: "Hizli Geri Donus" },
                { icon: "🔄", label: "Takas Imkani" },
                { icon: "🔧", label: "Yerinde Ekspertiz" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center backdrop-blur-sm"
                >
                  <span className="text-xl">{item.icon}</span>
                  <p className="mt-1 text-[10px] font-semibold leading-tight text-gray-400">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
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
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              Surec Nasil Isler
            </h3>
            <div className="space-y-3">
              {[
                {
                  adim: "1",
                  baslik: "Bilgileri Gonder",
                  aciklama: "Arac bilgilerini 4 adimda doldur, bize ulassin.",
                },
                {
                  adim: "2",
                  baslik: "Alim Ekibi Incelesin",
                  aciklama: "Ekibimiz aracinizi piyasa ve stok durumuna gore degerlendirir.",
                },
                {
                  adim: "3",
                  baslik: "Sizi Arayalim",
                  aciklama: "En kisa surede sizi arayip on degerlendirme sonucunu iletiriz.",
                },
                {
                  adim: "4",
                  baslik: "Randevu / Teklif",
                  aciklama: "Ekspertiz randevusu veya uygun teklifimizi sunariz.",
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

          {/* --- Sag: Form Kartı --- */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
              {/* Form ustu */}
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="text-base font-bold text-[#111827]">
                  Aracinizi Sancaktar&apos;a Satin
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Bilgileri eksiksiz doldurun, talebiniz Sancaktar alim ekibine
                  dussun.
                </p>
              </div>

              {/* Form govde */}
              <div className="px-6 py-5">
                <StepIndicator adim={adim} />

                {submitted ? (
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-6 py-10 text-center">
                    {/* Basari ikonu */}
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600">
                      <svg
                        className="h-7 w-7 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-black text-green-800">
                        Talebiniz alindi
                      </p>
                      <p className="mt-1 text-sm text-green-700">
                        Alim ekibimiz kisa surede sizinle iletisime gececek.
                      </p>
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
                        onMarkaChange={setMarka}
                        onYilChange={setYil}
                        onModelChange={setModel}
                        onDevam={() => setAdim(2)}
                      />
                    )}

                    {/* ADIM 2 */}
                    {adim === 2 && (
                      <Step2DurumBilgileri
                        km={km}
                        hasar={hasar}
                        tramer={tramer}
                        onKmChange={setKm}
                        onHasarChange={setHasar}
                        onTramerChange={setTramer}
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
