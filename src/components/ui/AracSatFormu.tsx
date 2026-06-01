"use client";

import { useState } from "react";
import type { LeadBuying } from "@/types";

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

interface AracSatFormuProps {
  onAddLead: (lead: LeadBuying) => void;
}

/* -------------------------------------------------------------------------- */
/*  Adım tipleri                                                              */
/* -------------------------------------------------------------------------- */

type Adim = 1 | 2 | 3 | 4;

const yillar = Array.from({ length: 16 }, (_, i) => 2010 + i);
const markalar = ["BMW", "Fiat", "Ford", "Honda", "Hyundai", "Mercedes", "Renault", "Toyota", "Volkswagen", "Volvo"];

/* -------------------------------------------------------------------------- */
/*  Bileşen                                                                   */
/* -------------------------------------------------------------------------- */

export default function AracSatFormu({ onAddLead }: AracSatFormuProps) {
  const [adim, setAdim] = useState<Adim>(1);

  // Step 1
  const [marka, setMarka] = useState("");
  const [yil, setYil] = useState<number | null>(null);
  const [model, setModel] = useState("");

  // Step 2
  const [km, setKm] = useState("");
  const [hasar, setHasar] = useState("");
  const [tramer, setTramer] = useState(false);

  // Step 4
  const [adSoyad, setAdSoyad] = useState("");
  const [telefon, setTelefon] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const handlePhone = (v: string) => {
    const cleaned = v.replace(/[^0-9+]/g, "");
    setTelefon(cleaned.length > 15 ? telefon : cleaned);
  };

  const handleSubmit = () => {
    if (!adSoyad.trim() || !telefon.trim()) return;
    const fiyatTahmini = Math.floor(Math.random() * 200_000) + 300_000;
    const lead: LeadBuying = {
      id: `LEAD-${Date.now().toString(36).toUpperCase()}-001`,
      customer_name: adSoyad.trim(),
      phone: telefon.trim(),
      brand: marka,
      model: model,
      year: yil ?? 2020,
      expected_price: fiyatTahmini,
      status: "Bekliyor",
    };
    onAddLead(lead);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setAdim(1);
      setMarka("");
      setYil(null);
      setModel("");
      setKm("");
      setHasar("");
      setTramer(false);
      setAdSoyad("");
      setTelefon("");
    }, 3000);
  };

  /* ── Adım Göstergesi ── */
  const StepIndicator = () => (
    <div className="mb-6 flex items-center gap-1">
      {([1, 2, 3, 4] as Adim[]).map((s, i) => (
        <div key={s} className="flex flex-1 items-center">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
              adim === s
                ? "bg-[#111827] text-white"
                : adim > s
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {adim > s ? "✓" : s}
          </div>
          {i < 3 && (
            <div
              className={`h-px flex-1 mx-1 ${
                adim > s + 1 ? "bg-green-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const labelStyles = "mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500";
  const inputStyles =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#111827] placeholder-gray-400 outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-gray-200";
  const btnGrid =
    "rounded-lg border px-3 py-2 text-xs font-medium transition-colors text-center";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-1 text-base font-bold text-[#111827]">Aracını Sancaktar&apos;a Sat</h2>
      <p className="mb-4 text-xs text-gray-500">4 adımda aracınızı değerlendirelim.</p>

      <StepIndicator />

      {submitted ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-6 text-center text-sm text-green-800">
          Talebiniz başarıyla alındı. Ekibimiz sizinle iletişime geçecek.
        </div>
      ) : (
        <>
          {/* ── ADIM 1: Araç Seçimi ── */}
          {adim === 1 && (
            <div className="space-y-4">
              <div>
                <label className={labelStyles}>Marka</label>
                <div className="flex flex-wrap gap-1.5">
                  {markalar.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMarka(m)}
                      className={`${btnGrid} ${
                        marka === m
                          ? "border-[#111827] bg-[#111827] text-white"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelStyles}>Model Yılı</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {yillar.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setYil(y)}
                      className={`${btnGrid} ${
                        yil === y
                          ? "border-[#111827] bg-[#111827] text-white"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelStyles}>Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Örn: Clio 4 Joy 1.2"
                  className={inputStyles}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!marka || !yil || !model.trim()}
                  onClick={() => setAdim(2)}
                  className="rounded-lg bg-[#111827] px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Devam
                </button>
              </div>
            </div>
          )}

          {/* ── ADIM 2: KM ve Hasar ── */}
          {adim === 2 && (
            <div className="space-y-4">
              <div>
                <label className={labelStyles}>Kilometre</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={km}
                  onChange={(e) => setKm(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="142.000"
                  className={inputStyles}
                />
              </div>

              <div>
                <label className={labelStyles}>Hasar Durumu</label>
                <div className="flex flex-wrap gap-1.5">
                  {["Hasarsız", "Boyalı", "Değişen Parça", "Ağır Hasar"].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHasar(h)}
                      className={`${btnGrid} ${
                        hasar === h
                          ? "border-[#111827] bg-[#111827] text-white"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={tramer}
                  onChange={(e) => setTramer(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                />
                <label className="text-xs text-gray-600">Tramer kaydı var</label>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setAdim(1)}
                  className="rounded-lg border border-gray-200 px-6 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Geri
                </button>
                <button
                  type="button"
                  disabled={!km}
                  onClick={() => setAdim(3)}
                  className="rounded-lg bg-[#111827] px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Devam
                </button>
              </div>
            </div>
          )}

          {/* ── ADIM 3: Ön Değerleme ── */}
          {adim === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <p className="text-xs text-green-600 uppercase tracking-wider font-semibold">
                  Tahmini Değer
                </p>
                <p className="mt-1 text-2xl font-black text-green-800">
                  {new Intl.NumberFormat("tr-TR").format(
                    Math.floor(Math.random() * 150_000) + 350_000
                  )}{" "}
                  ₺ -{" "}
                  {new Intl.NumberFormat("tr-TR").format(
                    Math.floor(Math.random() * 200_000) + 500_000
                  )}{" "}
                  ₺
                </p>
                <p className="mt-1 text-[11px] text-green-600">
                  * Girilen bilgilere göre ortalama piyasa değeridir.
                </p>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setAdim(2)}
                  className="rounded-lg border border-gray-200 px-6 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Geri
                </button>
                <button
                  type="button"
                  onClick={() => setAdim(4)}
                  className="rounded-lg bg-[#111827] px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-gray-800"
                >
                  Devam
                </button>
              </div>
            </div>
          )}

          {/* ── ADIM 4: İletişim ── */}
          {adim === 4 && (
            <div className="space-y-4">
              <div>
                <label className={labelStyles}>
                  Ad Soyad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={adSoyad}
                  onChange={(e) => setAdSoyad(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  className={inputStyles}
                />
              </div>

              <div>
                <label className={labelStyles}>
                  Telefon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={telefon}
                  onChange={(e) => handlePhone(e.target.value)}
                  placeholder="+90530 XXX XX XX"
                  className={inputStyles}
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setAdim(3)}
                  className="rounded-lg border border-gray-200 px-6 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Geri
                </button>
                <button
                  type="button"
                  disabled={!adSoyad.trim() || !telefon.trim()}
                  onClick={handleSubmit}
                  className="rounded-lg bg-green-700 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Teklif Al
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
