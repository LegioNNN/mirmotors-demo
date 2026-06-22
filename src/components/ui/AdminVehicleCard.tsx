"use client";

import { useState } from "react";
import type { Car } from "@/types";
import { displayStatus } from "@/types";

const formatPrice = (n: number) => new Intl.NumberFormat("tr-TR").format(n);
const formatKm = (n: number) => new Intl.NumberFormat("tr-TR").format(n);

const statusColors: Record<string, string> = {
  Aktif: "bg-emerald-100 text-emerald-700",
  Kaporalandı: "bg-amber-100 text-amber-700",
  Opsiyonlu: "bg-amber-100 text-amber-700",
  Satıldı: "bg-red-100 text-red-600",
  "Yayından Kaldırıldı": "bg-gray-100 text-gray-400",
};

export interface FormData {
  brand: string;
  model: string;
  year: string;
  price: string;
  km: string;
  fuel_type: string;
  transmission: string;
  segment: string;
  status: string;
  video_url: string;
  esnaf_notu: string;
  ekspertiz_durumu: import("@/types").EkspertizData;
  is_featured: boolean;
  is_hero: boolean;
}

interface AdminVehicleCardProps {
  car: Car;
  isUpdating: boolean;
  isEditing: boolean;
  updatingFeaturedId: string | null;
  updatingHeroId: string | null;
  deletingId: string | null;
  onStatusChange: (carId: string, newStatus: string) => void;
  onFeaturedToggle: (carId: string, currentValue: boolean | undefined) => void;
  onHeroToggle: (carId: string, currentValue: boolean | undefined) => void;
  onEditClick: (car: Car) => void;
  onDelete: (carId: string) => void;
}

export default function AdminVehicleCard({
  car, isUpdating, isEditing,
  updatingFeaturedId, updatingHeroId, deletingId,
  onStatusChange, onFeaturedToggle, onHeroToggle, onEditClick, onDelete,
}: AdminVehicleCardProps) {
  const statusClass = statusColors[car.status] || "bg-gray-100 text-gray-400";
  const firstImage = (car.images?.length ?? 0) > 0 ? car.images[0]?.trim() : "";
  const [imgError, setImgError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className={`rounded-lg border bg-white transition-all ${isEditing ? "border-[#111827] ring-1 ring-[#111827]/15 shadow-sm" : "border-gray-100 hover:border-gray-200 hover:shadow-sm"}`}>

      {/* Görsel — 3:2 oranı (daha az uzun) */}
      {firstImage && !imgError ? (
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={firstImage}
            alt={`${car.brand} ${car.model}`}
            className="aspect-[3/2] w-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-x-0 top-0 flex justify-between p-1.5">
            {car.is_hero && <span className="rounded bg-emerald-700/90 px-1.5 py-0.5 text-[9px] font-bold text-white">Hero</span>}
            {car.video_url && <span className="ml-auto rounded bg-blue-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white">Video</span>}
          </div>
          {(car.images?.length ?? 0) > 1 && (
            <span className="absolute bottom-1 right-1 rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-bold text-white">+{car.images.length - 1}</span>
          )}
        </div>
      ) : (
        <div className="flex aspect-[3/2] w-full items-center justify-center rounded-t-lg bg-gray-50">
          <svg className="h-7 w-7 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
            <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
            <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
            <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
          </svg>
        </div>
      )}

      {/* İçerik */}
      <div className="p-2.5">

        {/* Başlık + durum rozeti — tek satır */}
        <div className="flex items-center justify-between gap-1.5">
          <p className="truncate text-[11px] font-bold text-[#111827]">{car.brand} {car.model}</p>
          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${statusClass}`}>
            {displayStatus(car.status)}
          </span>
        </div>

        {/* Yıl + fiyat */}
        <div className="mt-0.5 flex items-baseline justify-between">
          <span className="text-[10px] text-gray-400">{car.year}{car.segment ? ` · ${car.segment}` : ""}</span>
          <span className="text-xs font-bold text-[#111827]">
            {car.price > 0 ? `${formatPrice(car.price)} ₺` : <span className="font-normal text-gray-400">—</span>}
          </span>
        </div>

        {/* Özellik satırı */}
        <div className="mt-1.5 flex items-center gap-1 text-[9px] text-gray-400">
          {car.km > 0 && <span>{formatKm(car.km)} km</span>}
          {car.km > 0 && <span>·</span>}
          {car.fuel_type && <span>{car.fuel_type}</span>}
          {car.transmission && <><span>·</span><span>{car.transmission}</span></>}
          {(car.images?.length ?? 0) > 0 && (
            <span className="ml-auto font-semibold text-emerald-600">{car.images.length} foto</span>
          )}
        </div>

        {/* Yayın durumu */}
        <div className="mt-2 flex items-center gap-1.5 rounded-md border border-gray-100 bg-gray-50 px-2 py-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Yayın</span>
          <select value={car.status} disabled={isUpdating}
            onChange={(e) => onStatusChange(car.id, e.target.value)}
            className="flex-1 bg-transparent text-[10px] font-semibold text-gray-700 outline-none disabled:opacity-40 cursor-pointer">
            <option value="Aktif">Aktif</option>
            <option value="Kaporalandı">Kaporalandı</option>
            <option value="Satıldı">Satıldı</option>
            <option value="Yayından Kaldırıldı">Yayından Kaldırıldı</option>
          </select>
        </div>

        {/* Aksiyon butonları */}
        <div className="mt-2 flex items-center gap-1">
          <button type="button" disabled={updatingFeaturedId === car.id}
            onClick={() => onFeaturedToggle(car.id, car.is_featured)}
            title={car.is_featured ? "Vitrinden Kaldır" : "Vitrine Çıkar"}
            className={`flex h-6 w-6 items-center justify-center rounded transition-all disabled:opacity-40 ${car.is_featured ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-500"}`}>
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill={car.is_featured ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>

          <button type="button" disabled={updatingHeroId === car.id}
            onClick={() => onHeroToggle(car.id, car.is_hero)}
            title={car.is_hero ? "Hero'dan Kaldır" : "Hero Yap"}
            className={`flex h-6 w-6 items-center justify-center rounded transition-all disabled:opacity-40 ${car.is_hero ? "bg-emerald-900 text-emerald-200" : "bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"}`}>
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill={car.is_hero ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
              <path d="M5 3l3 6.5L14 11l-4.5 4.5 1 6L5 18.5-.5 21.5l1-6L-4 11l6-1.5L5 3z" transform="translate(7 1)" />
            </svg>
          </button>

          <button type="button" onClick={() => onEditClick(car)}
            className={`flex h-6 items-center gap-1 rounded px-2 text-[10px] font-bold transition-all ${isEditing ? "bg-[#111827] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Düzenle
          </button>

          <a href={`/ilan/${car.id}`} target="_blank" rel="noopener noreferrer"
            className="flex h-6 items-center gap-1 rounded bg-gray-100 px-2 text-[10px] font-bold text-gray-500 transition-all hover:bg-blue-50 hover:text-blue-600">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Gör
          </a>

          <div className="ml-auto">
            {!confirmDelete ? (
              <button type="button" onClick={() => setConfirmDelete(true)} disabled={deletingId === car.id}
                className="flex h-6 w-6 items-center justify-center rounded text-gray-300 transition-all hover:bg-red-50 hover:text-red-400 disabled:opacity-40">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                </svg>
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => { onDelete(car.id); setConfirmDelete(false); }}
                  className="h-6 rounded bg-red-500 px-2 text-[9px] font-bold text-white hover:bg-red-600">Sil</button>
                <button type="button" onClick={() => setConfirmDelete(false)}
                  className="h-6 rounded border border-gray-200 px-2 text-[9px] font-semibold text-gray-500 hover:bg-gray-50">İptal</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
