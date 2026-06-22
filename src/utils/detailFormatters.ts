/* ======================================================================== */

/*  Ortak formatter fonksiyonlari - ilan detay sayfasi icin                 */
/* ======================================================================== */

import type { CarSegment, EkspertizData, EkspertizDurum } from "@/types";
import { EKSPERTIZ_PARTS } from "@/components/ui/AdminEkspertizPanel";

/**
 * Fiyati "1.234.567" formatina cevirir
 */
export const formatPrice = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "decimal", minimumFractionDigits: 0 }).format(n);

/**
 * KM'yi "22.000" formatina cevirir
 */
export const formatKm = (n: number) => new Intl.NumberFormat("tr-TR").format(n);

/* -------------------------------------------------------------------------- */
/*  Segment renkleri                                                          */
/* -------------------------------------------------------------------------- */
export interface SegmentStyle {
  label: string;
  wrapper: string;
  accentDot: string;
}

export const segmentConfig: Record<CarSegment, SegmentStyle> = {
  Kelepir: {
    label: "Fırsat",
    wrapper: "bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm shadow-emerald-200/50 px-2.5 py-1 rounded-lg text-[11px] font-semibold",
    accentDot: "bg-emerald-500",
  },
  "Orta Direk": {
    label: "Orta Segment",
    wrapper: "bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm shadow-indigo-200/50 px-2.5 py-1 rounded-lg text-[11px] font-semibold",
    accentDot: "bg-indigo-500",
  },
  Premium: {
    label: "Premium",
    wrapper: "bg-amber-50 border border-amber-200 text-amber-800 shadow-sm shadow-amber-200/50 px-2.5 py-1 rounded-lg text-[11px] font-bold ring-1 ring-amber-300/30",
    accentDot: "bg-amber-500",
  },
  "Yayla Kan": {
    label: "Fırsat",
    wrapper: "bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm shadow-emerald-200/50 px-2.5 py-1 rounded-lg text-[11px] font-semibold",
    accentDot: "bg-emerald-500",
  },
};

/* -------------------------------------------------------------------------- */
/*  Expertise parca tipi                                                      */
/* -------------------------------------------------------------------------- */
export interface ExpertisePart {
  label: string;
  status: "orijinal" | "lokal_boyali" | "boyali" | "degisen";
}

export const defaultParts: ExpertisePart[] = [
  { label: "Sol On Camurluk", status: "orijinal" },
  { label: "Sol On Kapi", status: "orijinal" },
  { label: "Sol Arka Kapi", status: "orijinal" },
  { label: "Sol Arka Camurluk", status: "orijinal" },
  { label: "Sag On Camurluk", status: "orijinal" },
  { label: "Sag On Kapi", status: "orijinal" },
  { label: "Sag Arka Kapi", status: "orijinal" },
  { label: "Sag Arka Camurluk", status: "orijinal" },
  { label: "On Tampon", status: "orijinal" },
  { label: "Arka Tampon", status: "orijinal" },
  { label: "Kaput", status: "orijinal" },
  { label: "Tavan", status: "orijinal" },
  { label: "Bagaj", status: "orijinal" },
];

const DURUM_MAP: Record<EkspertizDurum, ExpertisePart["status"]> = {
  "Orijinal":     "orijinal",
  "Lokal Boyalı": "lokal_boyali",
  "Boyalı":       "boyali",
  "Değişen":      "degisen",
};

const LABEL_MAP: Record<string, string> = {
  sol_on_camurluk:   "Sol Ön Çamurluk",
  sol_on_kapi:       "Sol Ön Kapı",
  sol_arka_kapi:     "Sol Arka Kapı",
  sol_arka_camurluk: "Sol Arka Çamurluk",
  on_tampon:         "Ön Tampon",
  kaput:             "Kaput",
  tavan:             "Tavan",
  bagaj:             "Bagaj",
  arka_tampon:       "Arka Tampon",
  sag_on_camurluk:   "Sağ Ön Çamurluk",
  sag_on_kapi:       "Sağ Ön Kapı",
  sag_arka_kapi:     "Sağ Arka Kapı",
  sag_arka_camurluk: "Sağ Arka Çamurluk",
};

/**
 * EkspertizData objesini ExpertisePart dizisine çevirir.
 * Geriye dönük uyumluluk için eski string/array formatını da destekler.
 */
export function parseExpertise(
  ekspertiz_durumu: EkspertizData | string | null | undefined
): ExpertisePart[] {
  if (!ekspertiz_durumu) return defaultParts;

  // Yeni format: obje
  if (typeof ekspertiz_durumu === "object" && !Array.isArray(ekspertiz_durumu)) {
    return EKSPERTIZ_PARTS.map((p) => ({
      label: LABEL_MAP[p.key] ?? p.label,
      status: DURUM_MAP[(ekspertiz_durumu as EkspertizData)[p.key] ?? "Orijinal"] ?? "orijinal",
    }));
  }

  // Eski string/array format
  if (typeof ekspertiz_durumu === "string") {
    try {
      const parsed = JSON.parse(ekspertiz_durumu);
      if (Array.isArray(parsed)) return parsed as ExpertisePart[];
    } catch { /* ignore */ }
  }

  return defaultParts;
}
