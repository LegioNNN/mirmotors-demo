"use client";

import { useState } from "react";

/* ======================================================================== */
/*  Step1AracBilgileri - Adim 1: Arac Bilgileri                             */
/*  Premium form: marka, model, paket/versiyon, yil,                        */
/*  yakit tipi, vites tipi, kasa tipi                                       */
/* ======================================================================== */

interface Step1AracBilgileriProps {
  marka: string;
  yil: number | null;
  model: string;
  paket: string;
  yakit: string;
  vites: string;
  kasa: string;
  onMarkaChange: (val: string) => void;
  onYilChange: (val: number | null) => void;
  onModelChange: (val: string) => void;
  onPaketChange: (val: string) => void;
  onYakitChange: (val: string) => void;
  onVitesChange: (val: string) => void;
  onKasaChange: (val: string) => void;
  onDevam: () => void;
}

const markalar = [
  "BMW", "Fiat", "Ford", "Honda", "Hyundai",
  "Mercedes", "Renault", "Toyota", "Volkswagen", "Volvo",
  "Audi", "Citroen", "Dacia", "Peugeot", "Skoda",
];

const yakitTipleri = ["Benzin", "Dizel", "LPG", "Benzin & LPG", "Hibrit", "Elektrik"];
const vitesTipleri = ["Manuel", "Otomatik", "Yarı Otomatik"];
const kasaTipleri = ["Sedan", "Hatchback", "SUV", "Station Wagon", "Coupe", "MPV", "Pickup", "Ticari"];

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#111827] placeholder-gray-400 outline-none ring-emerald-500/20 transition-all duration-200 focus:border-emerald-500 focus:ring-2";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500";

export default function Step1AracBilgileri({
  marka,
  yil,
  model,
  paket,
  yakit,
  vites,
  kasa,
  onMarkaChange,
  onYilChange,
  onModelChange,
  onPaketChange,
  onYakitChange,
  onVitesChange,
  onKasaChange,
  onDevam,
}: Step1AracBilgileriProps) {
  const [markaAcik, setMarkaAcik] = useState(false);
  const [markaArama, setMarkaArama] = useState("");

  const filtrelenmisMarkalar = markalar.filter((m) =>
    m.toLowerCase().includes(markaArama.toLowerCase())
  );

  const isValid = marka.trim() !== "" && yil !== null && model.trim() !== "";

  return (
    <div className="space-y-5">
      {/* Baslik ve alt metin */}
      <div>
        <h3 className="text-lg font-bold text-[#111827]">Araç Bilgileri</h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Aracınızın temel bilgilerini paylaşın, değerlendirme daha hızlı
          yapılsın.
        </p>
      </div>

      {/* Iki kolonlu grid - mobilde tek, desktopta iki */}
      <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
        {/* Marka */}
        <div className="relative">
          <label className={labelClass}>
            Marka <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => {
              setMarkaAcik(!markaAcik);
              setMarkaArama("");
            }}
            className={`${inputClass} flex w-full items-center justify-between text-left ${
              !marka ? "text-gray-400" : ""
            }`}
          >
            {marka || "Marka seçiniz"}
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                markaAcik ? "rotate-180" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {markaAcik && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-gray-200 bg-white shadow-lg">
              <div className="border-b border-gray-100 p-2">
                <input
                  type="text"
                  value={markaArama}
                  onChange={(e) => setMarkaArama(e.target.value)}
                  placeholder="Marka ara..."
                  className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-[#111827] placeholder-gray-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
              <div className="max-h-48 overflow-y-auto p-1">
                {filtrelenmisMarkalar.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      onMarkaChange(m);
                      setMarkaAcik(false);
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      marka === m
                        ? "bg-emerald-50 text-emerald-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {m}
                  </button>
                ))}
                {filtrelenmisMarkalar.length === 0 && (
                  <p className="px-3 py-4 text-center text-xs text-gray-400">
                    Marka bulunamadı
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Model */}
        <div>
          <label htmlFor="step1-model" className={labelClass}>
            Model <span className="text-red-500">*</span>
          </label>
          <input
            id="step1-model"
            type="text"
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            placeholder="Örn: Clio 4 Joy 1.2"
            className={inputClass}
          />
        </div>

        {/* Paket / Versiyon */}
        <div>
          <label htmlFor="step1-paket" className={labelClass}>
            Paket / Versiyon
          </label>
          <input
            id="step1-paket"
            type="text"
            value={paket}
            onChange={(e) => onPaketChange(e.target.value)}
            placeholder="Örn: Joy, Touch, Icon, Elegance, AMG, M Sport..."
            className={inputClass}
          />
        </div>

        {/* Model Yili */}
        <div>
          <label htmlFor="step1-yil" className={labelClass}>
            Model Yılı <span className="text-red-500">*</span>
          </label>
          <input
            id="step1-yil"
            type="text"
            inputMode="numeric"
            value={yil ?? ""}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "");
              if (val.length <= 4) onYilChange(val ? parseInt(val, 10) : null);
            }}
            placeholder="Örn: 2020"
            className={inputClass}
          />
        </div>

        {/* Yakit Tipi */}
        <div>
          <label className={labelClass}>Yakıt Tipi</label>
          <div className="flex flex-wrap gap-1.5">
            {yakitTipleri.map((yt) => (
              <button
                key={yt}
                type="button"
                onClick={() => onYakitChange(yakit === yt ? "" : yt)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 ${
                  yakit === yt
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {yt}
              </button>
            ))}
          </div>
        </div>

        {/* Vites Tipi */}
        <div>
          <label className={labelClass}>Vites Tipi</label>
          <div className="flex flex-wrap gap-1.5">
            {vitesTipleri.map((vt) => (
              <button
                key={vt}
                type="button"
                onClick={() => onVitesChange(vites === vt ? "" : vt)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 ${
                  vites === vt
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {vt}
              </button>
            ))}
          </div>
        </div>

        {/* Kasa Tipi */}
        <div>
          <label className={labelClass}>Kasa Tipi</label>
          <div className="flex flex-wrap gap-1.5">
            {kasaTipleri.map((kt) => (
              <button
                key={kt}
                type="button"
                onClick={() => onKasaChange(kasa === kt ? "" : kt)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 ${
                  kasa === kt
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {kt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Devam butonu */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          disabled={!isValid}
          onClick={onDevam}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-700/20 transition-all duration-200 hover:bg-emerald-600 hover:shadow-md hover:shadow-emerald-700/30 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none disabled:active:scale-100"
        >
          Devam
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
