"use client";

import { useState } from "react";
import type { EkspertizData, EkspertizDurum } from "@/types";

export const EKSPERTIZ_PARTS = [
  { key: "sol_on_camurluk",   label: "Sol Ön Çamurluk",   group: "sol" },
  { key: "sol_on_kapi",       label: "Sol Ön Kapı",        group: "sol" },
  { key: "sol_arka_kapi",     label: "Sol Arka Kapı",      group: "sol" },
  { key: "sol_arka_camurluk", label: "Sol Arka Çamurluk",  group: "sol" },
  { key: "on_tampon",         label: "Ön Tampon",          group: "govde" },
  { key: "kaput",             label: "Kaput",              group: "govde" },
  { key: "tavan",             label: "Tavan",              group: "govde" },
  { key: "bagaj",             label: "Bagaj",              group: "govde" },
  { key: "arka_tampon",       label: "Arka Tampon",        group: "govde" },
  { key: "sag_on_camurluk",   label: "Sağ Ön Çamurluk",   group: "sag" },
  { key: "sag_on_kapi",       label: "Sağ Ön Kapı",       group: "sag" },
  { key: "sag_arka_kapi",     label: "Sağ Arka Kapı",     group: "sag" },
  { key: "sag_arka_camurluk", label: "Sağ Arka Çamurluk", group: "sag" },
] as const;

export const DEFAULT_EKSPERTIZ: EkspertizData = Object.fromEntries(
  EKSPERTIZ_PARTS.map((p) => [p.key, "Orijinal" as EkspertizDurum])
);

const DURUMLAR: { value: EkspertizDurum; label: string; dot: string; ring: string }[] = [
  { value: "Orijinal",     label: "Orijinal",     dot: "bg-gray-300",   ring: "ring-gray-400 bg-gray-400" },
  { value: "Lokal Boyalı", label: "Lokal Boyalı", dot: "bg-orange-300", ring: "ring-orange-500 bg-orange-500" },
  { value: "Boyalı",       label: "Boyalı",       dot: "bg-blue-300",   ring: "ring-blue-500 bg-blue-500" },
  { value: "Değişen",      label: "Değişen",      dot: "bg-red-300",    ring: "ring-red-500 bg-red-500" },
];

const BADGE: Record<EkspertizDurum, string> = {
  "Orijinal":     "border-gray-200 bg-gray-50 text-gray-500",
  "Lokal Boyalı": "border-orange-200 bg-orange-50 text-orange-600",
  "Boyalı":       "border-blue-200 bg-blue-50 text-blue-600",
  "Değişen":      "border-red-200 bg-red-50 text-red-600",
};

const BADGE_ACTIVE: Record<EkspertizDurum, string> = {
  "Orijinal":     "border-gray-400 bg-gray-500 text-white",
  "Lokal Boyalı": "border-orange-500 bg-orange-500 text-white",
  "Boyalı":       "border-blue-500 bg-blue-500 text-white",
  "Değişen":      "border-red-500 bg-red-500 text-white",
};

interface Props {
  value: EkspertizData;
  onChange: (data: EkspertizData) => void;
}

// Parça başına mevcut durumu al, yoksa Orijinal
function getVal(value: EkspertizData, key: string): EkspertizDurum {
  return (value[key] as EkspertizDurum) ?? "Orijinal";
}

function PartRow({ label, current, onChange }: {
  label: string;
  current: EkspertizDurum;
  onChange: (v: EkspertizDurum) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-2.5 py-2">
      <p className="mb-1.5 text-[10px] font-semibold text-gray-600">{label}</p>
      <div className="flex gap-1.5">
        {DURUMLAR.map((d) => (
          <button
            key={d.value}
            type="button"
            title={d.label}
            onClick={() => onChange(d.value)}
            className={`h-4 w-4 rounded-full transition-all duration-150 ${
              current === d.value
                ? `${d.ring} scale-125 shadow-sm`
                : `${d.dot} opacity-30 hover:opacity-70 hover:scale-110`
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function AdminEkspertizPanel({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const update = (key: string, durum: EkspertizDurum) =>
    onChange({ ...value, [key]: durum });

  const solParts   = EKSPERTIZ_PARTS.filter((p) => p.group === "sol");
  const govdeParts = EKSPERTIZ_PARTS.filter((p) => p.group === "govde");
  const sagParts   = EKSPERTIZ_PARTS.filter((p) => p.group === "sag");

  // Sayaçlar: value boş olsa bile her parça default "Orijinal"
  const counts = DURUMLAR.map((d) => ({
    ...d,
    count: EKSPERTIZ_PARTS.filter((p) => getVal(value, p.key) === d.value).length,
  }));

  const hasChanges = counts.some((d) => d.value !== "Orijinal" && d.count > 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Başlık satırı */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-gray-500">Ekspertiz</span>
          {counts.map((d) => (
            <span key={d.value}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all ${
                d.count > 0 && d.value !== "Orijinal" ? BADGE_ACTIVE[d.value] : BADGE[d.value]
              }`}>
              {d.label}: {d.count}
            </span>
          ))}
          {!open && !hasChanges && (
            <span className="text-[11px] text-gray-400 italic">tıkla ve doldur</span>
          )}
        </div>
        <svg className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Animasyonlu içerik */}
      <div className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="border-t border-gray-100 px-3 py-3 space-y-4">

            {/* Legend */}
            <div className="flex items-center gap-3 text-[10px] text-gray-500">
              {DURUMLAR.map((d) => (
                <span key={d.value} className="flex items-center gap-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${d.ring}`} />
                  {d.label}
                </span>
              ))}
            </div>

            {/* 3 kolonlu grid */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-1 mb-1.5">Sol Taraf</p>
                {solParts.map((p) => (
                  <PartRow key={p.key} label={p.label}
                    current={getVal(value, p.key)} onChange={(v) => update(p.key, v)} />
                ))}
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-1 mb-1.5">Gövde</p>
                {govdeParts.map((p) => (
                  <PartRow key={p.key} label={p.label}
                    current={getVal(value, p.key)} onChange={(v) => update(p.key, v)} />
                ))}
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-1 mb-1.5">Sağ Taraf</p>
                {sagParts.map((p) => (
                  <PartRow key={p.key} label={p.label}
                    current={getVal(value, p.key)} onChange={(v) => update(p.key, v)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
