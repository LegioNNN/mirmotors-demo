/* ======================================================================== */
/*  CarDetailSidebar - Sag panel: fiyat, spec, WhatsApp, esnaf notu         */
/* ======================================================================== */

import type { Car } from "@/types";
import { formatPrice, formatKm } from "@/utils/detailFormatters";
import { brand } from "@/config/brand";
import React from "react";

interface Props {
  car: Car;
  onWpClick: () => void;
  wpLoading: boolean;
}

function SpecItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-gray-50/70 px-3 py-2.5">
      <svg
        className="h-4 w-4 shrink-0 text-gray-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        {icon === "calendar" && (
          <>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </>
        )}
        {icon === "speedometer" && (
          <>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </>
        )}
        {icon === "fuel" && (
          <path d="M3 22V12a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v10" />
        )}
        {icon === "gearbox" && (
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        )}
      </svg>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p className="text-sm font-bold text-[#111827] truncate">{value}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  TrustBadge - guven rozeti                                                */
/* -------------------------------------------------------------------------- */
function TrustBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50/50 px-2.5 py-1.5 text-[10px] font-semibold text-gray-600">
      <span className="shrink-0 text-gray-500">{icon}</span>
      {label}
    </div>
  );
}

export default function CarDetailSidebar({ car, onWpClick, wpLoading }: Props) {
  const isSold = car.status === "Satıldı";
  const isOptioned = car.status === "Kaporalandı" || (car.status as string) === "Opsiyonlu";
  const isFeatured = car.is_featured === true;
  const hasPrice = car.price > 0;

  return (
    <div className="hidden lg:block lg:col-span-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Brand & Model + Status rozetleri */}
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#111827]">{car.brand}</h1>
            <p className="text-base font-medium text-gray-500">{car.model}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {isFeatured && !isSold && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Öne Çıkan
              </span>
            )}
            {car.status === "Aktif" && !isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Stokta
              </span>
            )}
          </div>
        </div>

        {/* Fiyat */}
        <div className="mt-4 flex items-baseline gap-1.5">
          {hasPrice ? (
            <>
              <span className="text-3xl font-black tracking-tight text-[#111827]">
                {formatPrice(car.price)}
              </span>
              <span className="text-base font-bold text-gray-400">TL</span>
            </>
          ) : (
            <span className="text-lg font-extrabold tracking-tight text-green-700">
              Fiyat için arayın
            </span>
          )}
        </div>

        {/* Spec Grid */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <SpecItem icon="calendar" label="Model Yili" value={String(car.year)} />
          <SpecItem icon="speedometer" label="Kilometre" value={`${formatKm(car.km)} km`} />
          <SpecItem icon="fuel" label="Yakit" value={car.fuel_type} />
          <SpecItem icon="gearbox" label="Vites" value={car.transmission} />
        </div>

        {/* --- DURUM UYARILARI --- */}
        {isOptioned && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="text-xs font-medium text-amber-800">
              Bu araç için kapora süreci devam ediyor. Güncel durumu öğrenmek için WhatsApp üzerinden iletişime geçin.
            </p>
          </div>
        )}

        {isSold && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p className="text-xs font-medium text-red-800">
              Bu araç satılmıştır. Benzer araçlar için bizimle iletişime geçebilirsiniz.
            </p>
          </div>
        )}

        <div className="my-5 h-px bg-gray-100" />

        {/* Wp + Kapora Butonu (masaustu) */}
        {!isSold ? (
          <button
            type="button"
            onClick={onWpClick}
            disabled={wpLoading}
            className="hidden lg:flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {wpLoading ? "Yükleniyor..." : "WhatsApp ile Bilgi Al / Kapora"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onWpClick}
            disabled={wpLoading}
            className="hidden lg:flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-100 active:scale-[0.98] disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {wpLoading ? "Yükleniyor..." : "Benzer Araç Sor"}
          </button>
        )}

        {/* Guven rozetleri */}
        <div className="mt-4 flex flex-wrap gap-2">
          <TrustBadge
            icon={
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            }
            label="Galeri Güvencesi"
          />
          <TrustBadge
            icon={
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            }
            label="WhatsApp ile Hızlı Dönüş"
          />
          <TrustBadge
            icon={
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="10" r="3" />
                <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
              </svg>
            }
            label="Yerinde İnceleme"
          />
          <TrustBadge
            icon={
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M17 1l4 4-4 4" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <path d="M7 23l-4-4 4-4" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            }
            label="Takas Değerlendirme"
          />
        </div>

        {/* Esnaf Notu — dürüstlük kalbi */}
        <div className="mt-4 rounded-xl border border-amber-300/60 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-200 text-[10px] font-black text-amber-800 mt-0.5">
              {brand.owner.initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs font-bold text-amber-900">{brand.owner.name}</span>
                <span className="text-[10px] text-amber-600/70">— {brand.owner.noteLabel}</span>
              </div>
              <p className="text-sm leading-relaxed text-amber-900">
                {car.esnaf_notu ||
                  "Malımızın arkasındayız. Beğendiğin aracı gel gör, istediğin gibi ekspertize sok."}
              </p>
            </div>
          </div>
        </div>

        {/* Kısa özellikler */}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Takas Mümkün
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Ekspertiz Yaptırılabilir
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Krediye Uygun
          </span>
        </div>
      </div>
    </div>
  );
}
