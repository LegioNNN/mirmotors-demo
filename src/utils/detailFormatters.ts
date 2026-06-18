/* ======================================================================== */

/*  Ortak formatter fonksiyonlari - ilan detay sayfasi icin                 */
/* ======================================================================== */

import type { CarSegment } from "@/types";

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
  status: "orijinal" | "boyali" | "degisen";
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

/**
 * Ekspertiz durumu string'ini parse eder, hata durumunda defaultParts doner
 */
export function parseExpertise(
  ekspertiz_durumu: string | null | undefined
): ExpertisePart[] {
  if (!ekspertiz_durumu) return defaultParts;
  try {
    const parsed = JSON.parse(ekspertiz_durumu);
    if (Array.isArray(parsed)) return parsed as ExpertisePart[];
  } catch {
    /* ignore */
  }
  return defaultParts;
}
