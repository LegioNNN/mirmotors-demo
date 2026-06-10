"use client";

import { useState } from "react";
import Link from "next/link";
import type { Car, CarSegment } from "@/types";
import { createKaporaLink } from "@/utils/whatsappBalancer";
import { getCarImage } from "@/utils/carImages";

/* -------------------------------------------------------------------------- */
/*  Segment sabitleri                                                         */
/* -------------------------------------------------------------------------- */

const segmentConfig: Record<
  CarSegment,
  { label: string; badge: string; border: string; text: string }
> = {
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
/*  Placeholder - araç yoksa kaliteli görsel                                  */
/* -------------------------------------------------------------------------- */

function CarPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex flex-col items-center gap-2 text-gray-300">
        <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
          <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
          <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
        </svg>
        <span className="text-[10px] font-medium uppercase tracking-wider">Gorsel</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Bilesen                                                                   */
/* -------------------------------------------------------------------------- */

export default function CarCard({ car, onCompare, isCompared = false }: CarCardProps) {
  const seg = segmentConfig[car.segment];
  const carImage = getCarImage(car.id);
  const [imgError, setImgError] = useState(false);
  const [favHover, setFavHover] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const isSold = car.status === "Satıldı";
  const isOptioned = car.status === "Opsiyonlu";

  const handleWp = async () => {
    const result = await createKaporaLink(car.brand, car.model, car.year);
    if (result) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    } else {
      alert("Su anda tum personelimiz yogun.");
    }
  };

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white transition-all duration-300 ${
        isSold
          ? "border-gray-200 opacity-55 grayscale-[40%]"
          : isOptioned
            ? "border-amber-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-100/50"
            : "border-gray-100 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/60"
      }`}
    >
            {/* --- GORSEL ALAN --- */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {!imgError ? (
          <>
            {/* Zoom hover overlay */}
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/20">
              <div className="scale-0 rounded-full bg-white/90 p-2.5 opacity-0 shadow-lg transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                <svg className="h-4 w-4 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
            </div>
            <img
              src={carImage}
              alt={`${car.brand} ${car.model}`}
              className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
            {/* Image loading skeleton */}
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gray-100" />
            )}
          </>
        ) : (
          <CarPlaceholder />
        )}

        {/* Segment rozeti - sol ust (cam efekti) */}
        <div
          className={`absolute left-3 top-3 z-30 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-xl ${seg.border} ${seg.text}`}
          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${seg.badge}`} />
          {seg.label}
        </div>

        {/* Favori ikonu - sag ust (cam efekti) */}
        <button
          type="button"
          onMouseEnter={() => setFavHover(true)}
          onMouseLeave={() => setFavHover(false)}
          className="absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full text-gray-300 shadow-sm backdrop-blur-xl transition-all duration-200 hover:text-red-400"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          aria-label="Favorilere ekle"
        >
          <svg
            className="h-4 w-4 transition-all duration-200"
            viewBox="0 0 24 24"
            fill={favHover ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* SATILDI - overlay */}
        {isSold && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30">
            <span className="rotate-[-30deg] rounded-lg border-2 border-red-500 bg-red-600/90 px-6 py-2 text-sm font-black tracking-[0.25em] text-white shadow-xl backdrop-blur-sm">
              SATILDI
            </span>
          </div>
        )}

        {/* OPSIYONLU - overlay */}
        {isOptioned && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-amber-900/10">
            <span className="rotate-[-30deg] rounded-lg border-2 border-amber-500 bg-amber-500/85 px-6 py-2 text-sm font-black tracking-[0.25em] text-white shadow-xl backdrop-blur-sm">
              OPSIYONLU
            </span>
          </div>
        )}
      </div>

            {/* --- KART ICERIGI --- */}
      <div className="flex flex-1 flex-col p-4">
        {/* Marka + Model */}
        <div className="min-w-0">
          <h3 className="text-sm font-bold leading-tight text-[#111827]">{car.brand}</h3>
          <p className="mt-0.5 text-sm font-medium leading-tight text-gray-500">{car.model}</p>
        </div>

        {/* Spec Grid - 4 premium kutucuk */}
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          <SpecBadge label="Yil" value={String(car.year)} />
          <SpecBadge label="KM" value={`${formatKm(car.km)}`} />
          <SpecBadge label="Yakit" value={car.fuel_type} />
          <SpecBadge label="Vites" value={car.transmission} />
        </div>

        {/* --- FIYAT + KARSILASTIR --- */}
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Fiyat</p>
            <span className="text-xl font-black tracking-tight text-[#111827]">
              {formatPrice(car.price)} <span className="text-sm font-bold text-gray-500">TL</span>
            </span>
          </div>
          <label className="flex cursor-pointer items-center gap-1.5 text-[10px] font-medium text-gray-400 transition-colors hover:text-gray-600">
            <input
              type="checkbox"
              checked={isCompared}
              onChange={(e) => onCompare?.(car.id, e.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-300 text-gray-900 accent-gray-900 transition-colors"
            />
            Karsilastir
          </label>
        </div>

        {/* --- BUTONLAR --- */}
        {!isSold ? (
          <div className="mt-auto pt-3">
            <div className="flex gap-2">
              <Link
                href={`/ilan/${car.id}`}
                className="flex-1 rounded-lg bg-gradient-to-r from-[#1a2332] to-[#111827] px-4 py-2.5 text-center text-xs font-bold text-white shadow-sm transition-all hover:from-[#111827] hover:to-gray-800 hover:shadow-md active:scale-[0.98]"
              >
                Incele
              </Link>
              <button
                type="button"
                onClick={handleWp}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-green-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-green-600 hover:shadow-md active:scale-[0.98] min-w-[44px]"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="hidden sm:inline">Wp ile</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-auto pt-3">
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-center text-[11px] font-medium text-red-500">
              Bu arac satilmistir.
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*  SpecBadge - premium bilgi kutucugu                                        */
/* -------------------------------------------------------------------------- */

function SpecBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gradient-to-b from-gray-50 to-white px-1.5 py-1.5 text-center transition-colors group-hover:border-gray-200">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-0.5 text-[11px] font-bold text-gray-800 truncate">{value}</p>
    </div>
  );
}
