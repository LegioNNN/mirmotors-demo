"use client";

import { useState } from "react";

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

const MARKALAR = [
  "Dacia", "Renault", "Fiat", "Ford", "Toyota",
  "Volkswagen", "Opel", "Hyundai", "Kia", "Peugeot",
  "Citroen", "Skoda", "Seat", "BMW", "Mercedes",
  "Audi", "Honda", "Nissan", "Mitsubishi", "Volvo",
  "Alfa Romeo", "Chevrolet", "Jeep", "Land Rover", "Mazda",
  "Mini", "Porsche", "Subaru", "Suzuki", "Tofaş",
];

const YAKIT = ["Benzin", "Dizel", "LPG", "Benzin & LPG", "Hibrit", "Elektrik"];
const VITES = ["Manuel", "Otomatik", "Yarı Otomatik"];
const KASA  = ["Sedan", "Hatchback", "SUV", "Station Wagon", "Coupe", "MPV", "Pickup", "Ticari"];

const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#111827] placeholder-gray-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500";

function ChipGroup({ options, selected, onSelect }: {
  options: string[]; selected: string; onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onSelect(selected === opt ? "" : opt)}
          className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all active:scale-95 ${
            selected === opt
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30"
              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
          }`}>
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function Step1AracBilgileri({
  marka, yil, model, paket, yakit, vites, kasa,
  onMarkaChange, onYilChange, onModelChange, onPaketChange,
  onYakitChange, onVitesChange, onKasaChange, onDevam,
}: Step1AracBilgileriProps) {
  const [markaAcik, setMarkaAcik] = useState(false);
  const [markaArama, setMarkaArama] = useState("");

  const filtrelenmis = MARKALAR.filter((m) =>
    m.toLowerCase().includes(markaArama.toLowerCase())
  );

  const yilGecerli = yil !== null && String(yil).length === 4;
  const isValid = marka.trim() !== "" && yilGecerli && model.trim() !== "";

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-[#111827]">Araç Bilgileri</h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Aracınızın temel bilgilerini paylaşın.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">

        {/* Marka — dropdown */}
        <div className="relative">
          <label className={labelClass}>Marka <span className="text-red-500">*</span></label>
          <button
            type="button"
            onClick={() => { setMarkaAcik(!markaAcik); setMarkaArama(""); }}
            className={`${inputClass} flex items-center justify-between text-left ${!marka ? "text-gray-400" : ""}`}
          >
            {marka || "Marka seçiniz"}
            <svg className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${markaAcik ? "rotate-180" : ""}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="6 9 12 15 18 9"/>
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
                  className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-[#111827] placeholder-gray-400 outline-none focus:border-emerald-500"
                />
              </div>
              <div className="max-h-48 overflow-y-auto p-1">
                {filtrelenmis.map((m) => (
                  <button key={m} type="button"
                    onClick={() => { onMarkaChange(m); setMarkaAcik(false); }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      marka === m ? "bg-emerald-50 font-semibold text-emerald-700" : "text-gray-700 hover:bg-gray-50"
                    }`}>
                    {m}
                  </button>
                ))}
                {filtrelenmis.length === 0 && (
                  <div className="p-2">
                    <p className="mb-2 px-2 text-center text-xs text-gray-400">Listede yok</p>
                    <button
                      type="button"
                      onClick={() => { onMarkaChange(markaArama); setMarkaAcik(false); }}
                      className="w-full rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-left text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      &ldquo;{markaArama}&rdquo; olarak ekle
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Model */}
        <div>
          <label htmlFor="s1-model" className={labelClass}>Model <span className="text-red-500">*</span></label>
          <input id="s1-model" type="text" value={model}
            onChange={(e) => onModelChange(e.target.value)}
            placeholder="Örn: Clio, Duster, Passat..."
            className={inputClass}/>
        </div>

        {/* Model Yılı */}
        <div>
          <label htmlFor="s1-yil" className={labelClass}>Model Yılı <span className="text-red-500">*</span></label>
          <input id="s1-yil" type="text" inputMode="numeric" value={yil ?? ""}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, "");
              if (v.length <= 4) onYilChange(v ? parseInt(v, 10) : null);
            }}
            placeholder="Örn: 2020"
            className={`${inputClass} ${yil !== null && !yilGecerli ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : ""}`}/>
          {yil !== null && !yilGecerli && (
            <p className="mt-1 text-xs text-red-500">4 haneli yıl girin (örn: 2020)</p>
          )}
        </div>

        {/* Paket */}
        <div>
          <label htmlFor="s1-paket" className={labelClass}>Paket / Versiyon</label>
          <input id="s1-paket" type="text" value={paket}
            onChange={(e) => onPaketChange(e.target.value)}
            placeholder="Örn: Joy, Touch, Icon, AMG..."
            className={inputClass}/>
        </div>

        {/* Yakıt */}
        <div>
          <label className={labelClass}>Yakıt Tipi</label>
          <ChipGroup options={YAKIT} selected={yakit} onSelect={onYakitChange}/>
        </div>

        {/* Vites */}
        <div>
          <label className={labelClass}>Vites</label>
          <ChipGroup options={VITES} selected={vites} onSelect={onVitesChange}/>
        </div>

        {/* Kasa */}
        <div className="md:col-span-2">
          <label className={labelClass}>Kasa Tipi</label>
          <ChipGroup options={KASA} selected={kasa} onSelect={onKasaChange}/>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button type="button" disabled={!isValid} onClick={onDevam}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40">
          Devam
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
