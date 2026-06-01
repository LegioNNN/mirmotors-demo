"use client";

import { useState } from "react";
import type { Car, CarSegment } from "@/types";
import { createKaporaLink } from "@/utils/whatsappBalancer";
import { getCarImage } from "@/utils/carImages";

/* -------------------------------------------------------------------------- */
/*  Segment sabitleri                                                         */
/* -------------------------------------------------------------------------- */

const segmentConfig: Record<
  CarSegment,
  { label: string; badgeBg: string; badgeText: string; badgeBorder: string; dot: string }
> = {
  Kelepir: {
    label: "Kelepir",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  "Orta Direk": {
    label: "Orta Direk",
    badgeBg: "bg-sky-50",
    badgeText: "text-sky-700",
    badgeBorder: "border-sky-200",
    dot: "bg-sky-500",
  },
  Premium: {
    label: "Premium",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200",
    dot: "bg-amber-500",
  },
  "Yayla Kan": {
    label: "Yayla Kan",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    badgeBorder: "border-rose-200",
    dot: "bg-rose-500",
  },
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const formatPrice = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "decimal", minimumFractionDigits: 0 }).format(n);

const formatKm = (n: number) => new Intl.NumberFormat("tr-TR").format(n);

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

interface CarCardProps {
  car: Car;
  onCompare?: (id: string, checked: boolean) => void;
  isCompared?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Bileşen                                                                   */
/* -------------------------------------------------------------------------- */

export default function CarCard({ car, onCompare, isCompared = false }: CarCardProps) {
  const seg = segmentConfig[car.segment];
  const carImage = getCarImage(car.id);
  const [imgError, setImgError] = useState(false);

  const isSold = car.status === "Satıldı";
  const isOptioned = car.status === "Opsiyonlu";

  const handleWp = () => {
    const result = createKaporaLink(car.brand, car.model, car.year);
    if (result) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    } else {
      alert("Şu anda tüm personelimiz yoğun.");
    }
  };

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white transition-shadow ${
        isSold ? "border-gray-200 opacity-60 grayscale-[30%]" : "border-gray-100 hover:shadow-lg"
      }`}
    >
      {/* ── Görsel Alan ── */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
        {!imgError ? (
          <img
            src={carImage}
            alt={`${car.brand} ${car.model}`}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300 text-sm">
            Görsel
          </div>
        )}

        {/* Segment rozeti – sol üst */}
        <div
          className={`absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-sm ${seg.badgeBg} ${seg.badgeText} ${seg.badgeBorder}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${seg.dot}`} />
          {seg.label}
        </div>

        {/* Kalp ikonu – favori (sağ üst) */}
        <button
          type="button"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-400 shadow-sm backdrop-blur-sm transition-colors hover:text-red-500"
          aria-label="Favorilere ekle"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* SATILDI – köşegen kırmızı şerit */}
        {isSold && (
          <div className="pointer-events-none absolute right-0 top-0 z-10">
            <div className="relative">
              <svg viewBox="0 0 120 120" className="h-28 w-28">
                <polygon points="120,0 0,0 120,120" fill="#dc2626" />
              </svg>
              <span className="absolute right-1 top-3 -rotate-45 text-[10px] font-black tracking-wider text-white">
                SATILDI
              </span>
            </div>
          </div>
        )}

        {/* OPSİYONLU – köşegen sarı şerit */}
        {isOptioned && (
          <div className="pointer-events-none absolute right-0 top-0 z-10">
            <div className="relative">
              <svg viewBox="0 0 120 120" className="h-28 w-28">
                <polygon points="120,0 0,0 120,120" fill="#d97706" />
              </svg>
              <span className="absolute right-1 top-3 -rotate-45 text-[10px] font-black tracking-wider text-white">
                OPSİYONLU
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Kart İçeriği ── */}
      <div className="flex flex-col p-4">
        {/* Marka + Model */}
        <h3 className="text-sm font-bold text-[#111827]">{car.brand}</h3>
        <p className="text-sm text-gray-500">{car.model}</p>

        {/* Spec Grid – 4 kolonlu */}
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          <SpecBox label="Yıl" value={String(car.year)} />
          <SpecBox label="KM" value={`${formatKm(car.km)} km`} />
          <SpecBox label="Yakıt" value={car.fuel_type} />
          <SpecBox label="Vites" value={car.transmission} />
        </div>

        {/* Ayraç */}
        <div className="my-3 h-px w-full bg-gray-100" />

        {/* Fiyat + Karşılaştır */}
        <div className="flex items-end justify-between">
          <span className="text-xl font-black tracking-tight text-[#111827]">
            {formatPrice(car.price)} ₺
          </span>
          <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-400">
            <input
              type="checkbox"
              checked={isCompared}
              onChange={(e) => onCompare?.(car.id, e.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-300 text-[#111827] accent-gray-900"
            />
            Karşılaştır
          </label>
        </div>

        {/* Butonlar – "İncele" + WhatsApp */}
        {!isSold ? (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-lg bg-[#111827] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-800"
            >
              İncele
            </button>
            <button
              type="button"
              onClick={handleWp}
              className="flex items-center justify-center rounded-lg bg-green-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-green-600"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="mt-3 text-center text-[11px] font-medium text-red-500">
            Bu araç satılmıştır.
          </div>
        )}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*  SpecBox – gri hücre                                                       */
/* -------------------------------------------------------------------------- */

function SpecBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-1.5 py-1.5 text-center">
      <p className="text-[9px] font-medium uppercase tracking-wider text-gray-400">{label}</p>
      <p className="text-[11px] font-semibold text-gray-800 truncate">{value}</p>
    </div>
  );
}
