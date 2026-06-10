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
  badge: string;
  border: string;
  text: string;
}

export const segmentConfig: Record<CarSegment, SegmentStyle> = {
  Kelepir: {
    label: "Kelepir",
    badge: "bg-emerald-500",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
  },
  "Orta Direk": {
    label: "Orta Direk",
    badge: "bg-sky-500",
    border: "border-sky-500/30",
    text: "text-sky-400",
  },
  Premium: {
    label: "Premium",
    badge: "bg-amber-500",
    border: "border-amber-500/30",
    text: "text-amber-400",
  },
  "Yayla Kan": {
    label: "Yayla Kan",
    badge: "bg-rose-500",
    border: "border-rose-500/30",
    text: "text-rose-400",
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
