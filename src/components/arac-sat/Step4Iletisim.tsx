"use client";

import { brand } from "@/config/brand";

/* ======================================================================== */
/*  Step4Iletisim - Adim 4: Iletisim ve Onay                                 */
/*  Ad soyad, telefon, sehir/ilce, iletisim tercihi, KVKK, gonderim         */
/* ======================================================================== */

interface Step4IletisimProps {
  adSoyad: string;
  telefon: string;
  sehir: string;
  ilce: string;
  iletisimTercihi: "telefon" | "whatsapp";
  kvkk: boolean;
  submitting: boolean;
  onAdSoyadChange: (val: string) => void;
  onTelefonChange: (val: string) => void;
  onSehirChange: (val: string) => void;
  onIlceChange: (val: string) => void;
  onIletisimTercihiChange: (val: "telefon" | "whatsapp") => void;
  onKvkkChange: (val: boolean) => void;
  onGeri: () => void;
  onSubmit: () => void;
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#111827] placeholder-gray-400 outline-none ring-emerald-500/20 transition-all duration-200 focus:border-emerald-500 focus:ring-2";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500";

export default function Step4Iletisim({
  adSoyad,
  telefon,
  sehir,
  ilce,
  iletisimTercihi,
  kvkk,
  submitting,
  onAdSoyadChange,
  onTelefonChange,
  onSehirChange,
  onIlceChange,
  onIletisimTercihiChange,
  onKvkkChange,
  onGeri,
  onSubmit,
}: Step4IletisimProps) {
  const isValid = adSoyad.trim() !== "" && telefon.trim() !== "" && kvkk;

  return (
    <div className="space-y-5">
      {/* Baslik ve alt metin */}
      <div>
        <h3 className="text-lg font-bold text-[#111827]">İletişim ve Onay</h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Talebinizi tamamlamak için iletişim bilgilerinizi girin. Alım
          ekibimiz kısa sürede sizinle iletişime geçecektir.
        </p>
      </div>

      {/* Iki kolonlu grid - mobilde tek, desktopta iki */}
      <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
        {/* Ad Soyad */}
        <div>
          <label htmlFor="step4-adsoyad" className={labelClass}>
            Ad Soyad <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              id="step4-adsoyad"
              type="text"
              value={adSoyad}
              onChange={(e) => onAdSoyadChange(e.target.value)}
              placeholder="Adınız Soyadınız"
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        {/* Telefon */}
        <div>
          <label htmlFor="step4-telefon" className={labelClass}>
            Telefon <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <input
              id="step4-telefon"
              type="tel"
              value={telefon}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^0-9+]/g, "");
                if (cleaned.length <= 15) onTelefonChange(cleaned);
              }}
              placeholder="05xx xxx xx xx"
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        {/* Sehir */}
        <div>
          <label htmlFor="step4-sehir" className={labelClass}>
            Şehir
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <input
              id="step4-sehir"
              type="text"
              value={sehir}
              onChange={(e) => onSehirChange(e.target.value)}
              placeholder="İstanbul"
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        {/* Ilce */}
        <div>
          <label htmlFor="step4-ilce" className={labelClass}>
            İlçe
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <input
              id="step4-ilce"
              type="text"
              value={ilce}
              onChange={(e) => onIlceChange(e.target.value)}
              placeholder="Kadıköy"
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>
      </div>

      {/* Tercih Edilen Iletisim */}
      <div>
        <label className={labelClass}>Tercih Edilen İletişim</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onIletisimTercihiChange("telefon")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
              iletisimTercihi === "telefon"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Telefon
          </button>
          <button
            type="button"
            onClick={() => onIletisimTercihiChange("whatsapp")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
              iletisimTercihi === "whatsapp"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            WhatsApp
          </button>
        </div>
      </div>

      {/* KVKK */}
      <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3">
        <div className="relative flex items-start">
          <input
            type="checkbox"
            id="step4-kvkk"
            checked={kvkk}
            onChange={(e) => onKvkkChange(e.target.checked)}
            className="peer mt-0.5 h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 bg-white transition-all duration-200 checked:border-emerald-600 checked:bg-emerald-600 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          <svg
            className="pointer-events-none absolute left-0 top-0.5 mt-0.5 h-5 w-5 text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <label htmlFor="step4-kvkk" className="cursor-pointer text-xs leading-relaxed text-gray-600">
          <span className="font-semibold text-red-500">*</span>{" "}
          <span className="font-medium">KVKK Onayı:</span> Kişisel
          verilerimin {brand.name} tarafından araç alım
          değerlendirmesi kapsamında işlenmesini kabul ediyorum.
        </label>
      </div>

      {/* Geri / Gonder */}
      <div className="flex justify-between pt-1">
        <button
          type="button"
          onClick={onGeri}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.97]"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Geri
        </button>
        <button
          type="button"
          disabled={!isValid || submitting}
          onClick={onSubmit}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-700/20 transition-all duration-200 hover:bg-emerald-600 hover:shadow-md hover:shadow-emerald-700/30 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none disabled:active:scale-100"
        >
          {submitting ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth={4}
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Gönderiliyor...
            </>
          ) : (
            <>
              Talebimi Gönder
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
