"use client";

import { useState } from "react";
import type { Car } from "@/types";
import { displayStatus } from "@/types";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const formatPrice = (n: number) => new Intl.NumberFormat("tr-TR").format(n);
const formatKm = (n: number) => new Intl.NumberFormat("tr-TR").format(n);

const statusColors: Record<string, string> = {
  Aktif: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Kaporalandı: "bg-amber-100 text-amber-700 border-amber-200",
  Opsiyonlu: "bg-amber-100 text-amber-700 border-amber-200",
  Satıldı: "bg-red-100 text-red-700 border-red-200",
  "Yayından Kaldırıldı": "bg-gray-100 text-gray-500 border-gray-200",
};

/* -------------------------------------------------------------------------- */
/*  Form state tipi (parent ile aynı)                                        */
/* -------------------------------------------------------------------------- */
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
  image_url: string;
  is_featured: boolean;
  is_hero: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */
interface AdminVehicleCardProps {
  car: Car;
  isUpdating: boolean;
  isEditing: boolean;
  updatingFeaturedId: string | null;
  updatingHeroId: string | null;
  editForm: FormData;
  editError: string | null;
  editingSaving: boolean;
  uploadingImage: boolean;
  uploadSuccess: string | null;
  onStatusChange: (carId: string, newStatus: string) => void;
  onFeaturedToggle: (carId: string, currentValue: boolean | undefined) => void;
  onHeroToggle: (carId: string, currentValue: boolean | undefined) => void;
  onEditClick: (car: Car) => void;
  onEditCancel: () => void;
  onEditChange: (field: keyof FormData, value: string) => void;
  onEditSave: (carId: string) => void;
  onFileUpload: (carId: string, file: File) => void;
}

/* -------------------------------------------------------------------------- */
/*  Bilesen                                                                   */
/* -------------------------------------------------------------------------- */
export default function AdminVehicleCard({
  car,
  isUpdating,
  isEditing,
  updatingFeaturedId,
  updatingHeroId,
  editForm,
  editError,
  editingSaving,
  uploadingImage,
  uploadSuccess,
  onStatusChange,
  onFeaturedToggle,
  onHeroToggle,
  onEditClick,
  onEditCancel,
  onEditChange,
  onEditSave,
  onFileUpload,
}: AdminVehicleCardProps) {
  const statusClass = statusColors[car.status] || "bg-gray-100 text-gray-600 border-gray-200";

  // Görsel seçimi: boş string, boşluk, undefined, boş dizi durumlarında fallback
  const uploadedImage = (car.images?.length ?? 0) > 0 ? car.images[0]?.trim() : "";
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group rounded-xl border border-gray-100 bg-white p-4 transition-all duration-150 hover:border-gray-300 hover:shadow-md">
      {/* Kapak görseli */}
      {uploadedImage && !imgError ? (
        <div className="group mb-3 aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
          <img
            src={uploadedImage}
            alt={`${car.brand} ${car.model}`}
            className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div className="mb-3 flex aspect-[16/9] w-full flex-col items-center justify-center gap-1.5 rounded-lg bg-gradient-to-b from-gray-50 to-gray-100">
          <svg className="h-10 w-10 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
            <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
            <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
            <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
          </svg>
          <p className="text-[10px] font-medium text-gray-400">Görsel yok</p>
        </div>
      )}

      {/* Üst: Marka/Model + yıl/segment/ID + Durum badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-[#111827]">
            {car.brand} {car.model}
          </h3>
          <p className="mt-0.5 truncate text-xs text-gray-400">
            {car.year}{car.segment ? " • " + car.segment : ""}
            <span className="ml-1.5 font-mono text-gray-300">#{car.id}</span>
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border-2 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ${statusClass}`}
        >
          {displayStatus(car.status)}
        </span>
      </div>

      {/* Fiyat — öne çıkarılmış */}
      <div className="mt-2.5">
        <p className="text-lg font-bold text-[#111827]">
          {car.price > 0 ? `${formatPrice(car.price)} ₺` : (
            <span className="text-sm font-medium text-gray-400">Fiyat girilmedi</span>
          )}
        </p>
      </div>

      {/* Özellik chip'leri */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-md border border-gray-100 bg-gray-50 px-2 py-1 text-[10px] text-gray-600">
          <span className="font-semibold uppercase tracking-wider text-gray-400">KM:</span>
          {car.km > 0 ? `${formatKm(car.km)} km` : "—"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-gray-100 bg-gray-50 px-2 py-1 text-[10px] text-gray-600">
          <span className="font-semibold uppercase tracking-wider text-gray-400">Yakıt:</span>
          {car.fuel_type || "—"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-gray-100 bg-gray-50 px-2 py-1 text-[10px] text-gray-600">
          <span className="font-semibold uppercase tracking-wider text-gray-400">Vites:</span>
          {car.transmission || "—"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-gray-100 bg-gray-50 px-2 py-1 text-[10px] text-gray-600">
          <span className="font-semibold uppercase tracking-wider text-gray-400">Segment:</span>
          {car.segment || "—"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-gray-100 bg-gray-50 px-2 py-1 text-[10px] text-gray-600">
          <span className="font-semibold uppercase tracking-wider text-gray-400">Görsel:</span>
          {uploadedImage && !imgError ? (
            <span className="inline-flex items-center gap-0.5 text-emerald-600">
              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Var
            </span>
          ) : (
            <span className="text-gray-400">Yok</span>
          )}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-gray-100 bg-gray-50 px-2 py-1 text-[10px] text-gray-600">
          <span className="font-semibold uppercase tracking-wider text-gray-400">Vitrin:</span>
          {car.is_featured ? (
            <span className="inline-flex items-center gap-0.5 text-amber-600">
              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Aktif
            </span>
          ) : (
            <span className="text-gray-400">Pasif</span>
          )}
        </span>
        {car.is_hero && (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-900 px-2 py-1 text-[10px] text-emerald-100 shadow-sm">
            <svg className="h-2.5 w-2.5 text-emerald-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Hero&rsquo;da
          </span>
        )}
      </div>

      {/* Yayın Durumu kontrolü */}
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-2.5 py-1.5">
        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Yayın Durumu</label>
        <select
          value={car.status}
          disabled={isUpdating}
          onChange={(e) => onStatusChange(car.id, e.target.value)}
          className="rounded-md border-0 bg-transparent px-1 py-0 text-[11px] font-semibold text-gray-700 outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <option value="Aktif">Aktif</option>
          <option value="Kaporalandı">Kaporalandı</option>
          <option value="Satıldı">Satıldı</option>
          <option value="Yayından Kaldırıldı">Yayından Kaldırıldı</option>
        </select>
      </div>

      {/* Vitrine Çıkar / Vitrinden Kaldır */}
      <div className="mt-2">
        <button
          type="button"
          disabled={updatingFeaturedId === car.id}
          onClick={() => onFeaturedToggle(car.id, car.is_featured)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
            car.is_featured
              ? "bg-amber-50 text-amber-700 ring-1 ring-amber-300 hover:bg-amber-100"
              : "bg-gray-50 text-gray-500 ring-1 ring-gray-200 hover:bg-amber-50 hover:text-amber-600 hover:ring-amber-200"
          }`}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={car.is_featured ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {updatingFeaturedId === car.id ? "Güncelleniyor..." : car.is_featured ? "Vitrinden Kaldır" : "Vitrine Çıkar"}
        </button>
      </div>

      {/* Hero Aracı Yap / Hero'dan Kaldır */}
      <div className="mt-1.5">
        <button
          type="button"
          disabled={updatingHeroId === car.id}
          onClick={() => onHeroToggle(car.id, car.is_hero)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
            car.is_hero
              ? "bg-emerald-900 text-emerald-100 ring-1 ring-emerald-500/50 hover:bg-emerald-800"
              : "bg-gray-50 text-gray-500 ring-1 ring-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:ring-emerald-300"
          }`}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={car.is_hero ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {updatingHeroId === car.id ? "Güncelleniyor..." : car.is_hero ? "Hero&rsquo;dan Kaldır" : "Hero Aracı Yap"}
        </button>
      </div>

      {/* Düzenle butonu — aksiyonlarla aynı hizada */}
      {!isEditing && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => onEditClick(car)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-gray-500 transition-all hover:border-[#111827] hover:text-[#111827] hover:shadow-sm"
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Düzenle
          </button>
        </div>
      )}

      {/* Düzenleme formu — ayrık panel */}
      {isEditing && (
        <div className="mt-3 rounded-xl border-2 border-gray-200 bg-white p-4 shadow-inner">
          <p className="mb-3 text-[9px] font-bold uppercase tracking-wider text-gray-400">Araç Bilgilerini Düzenle</p>
          <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
            <div>
              <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-gray-500">Marka *</label>
              <input type="text" value={editForm.brand} onChange={(e) => onEditChange("brand", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-[#111827] outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-[#111827]/10" />
            </div>
            <div>
              <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-gray-500">Model *</label>
              <input type="text" value={editForm.model} onChange={(e) => onEditChange("model", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-[#111827] outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-[#111827]/10" />
            </div>
            <div>
              <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-gray-500">Yıl</label>
              <input type="text" value={editForm.year} onChange={(e) => onEditChange("year", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-[#111827] outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-[#111827]/10" />
            </div>
            <div>
              <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-gray-500">Fiyat *</label>
              <input type="text" value={editForm.price} onChange={(e) => onEditChange("price", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-[#111827] outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-[#111827]/10" />
            </div>
            <div>
              <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-gray-500">KM</label>
              <input type="text" value={editForm.km} onChange={(e) => onEditChange("km", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-[#111827] outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-[#111827]/10" />
            </div>
            <div>
              <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-gray-500">Fotoğraf Yükle</label>
              <div className="flex items-center gap-2">
                <label className={`relative flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-500 transition-all hover:border-gray-400 hover:text-gray-700 ${uploadingImage ? "opacity-50 pointer-events-none" : ""}`}>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={uploadingImage}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onFileUpload(car.id, file);
                      // 10. Input temizleme - aynı dosyayı tekrar seçmeye izin vermek için
                      e.currentTarget.value = "";
                    }}
                  />
                  {uploadingImage ? (
                    <>
                      <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Fotoğraf yükleniyor...
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      Yükle
                    </>
                  )}
                </label>
                {uploadingImage && (
                  <span className="text-[9px] text-emerald-600 font-medium">Fotoğraf yükleniyor...</span>
                )}
                {!uploadingImage && editForm.image_url && (
                  <span className="text-[9px] text-emerald-600 font-medium">✓ Görsel seçildi</span>
                )}
              </div>
            </div>
            <div>
              <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-gray-500">Yakıt</label>
              <select value={editForm.fuel_type} onChange={(e) => onEditChange("fuel_type", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-[#111827] outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-[#111827]/10">
                <option value="Benzin">Benzin</option>
                <option value="Dizel">Dizel</option>
                <option value="Elektrik">Elektrik</option>
                <option value="Hibrit">Hibrit</option>
                <option value="LPG">LPG</option>
              </select>
            </div>
            <div>
              <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-gray-500">Vites</label>
              <select value={editForm.transmission} onChange={(e) => onEditChange("transmission", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-[#111827] outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-[#111827]/10">
                <option value="Otomatik">Otomatik</option>
                <option value="Manuel">Manuel</option>
                <option value="Yarı Otomatik">Yarı Otomatik</option>
              </select>
            </div>
            <div>
              <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-gray-500">Segment</label>
              <select value={editForm.segment} onChange={(e) => onEditChange("segment", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-[#111827] outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-[#111827]/10">
                <option value="Kelepir">Fırsat</option>
                <option value="Orta Direk">Orta Segment</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
            <div>
              <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-gray-500">Durum</label>
              <select value={editForm.status} onChange={(e) => onEditChange("status", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-[#111827] outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-[#111827]/10">
                <option value="Aktif">Aktif</option>
                <option value="Kaporalandı">Kaporalandı</option>
                <option value="Satıldı">Satıldı</option>
                <option value="Yayından Kaldırıldı">Yayından Kaldırıldı</option>
              </select>
            </div>
          </div>

          {/* Vitrinde Öne Çıkar checkbox */}
          <div className="mt-3 flex items-center">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2">
              <input
                type="checkbox"
                checked={editForm.is_featured}
                onChange={(e) => onEditChange("is_featured", e.target.checked ? "true" : "false")}
                className="h-4 w-4 rounded border-gray-300 text-amber-500 accent-amber-500 focus:ring-amber-500"
              />
              <span className="text-[10px] font-medium text-gray-600 select-none">Vitrinde öne çıkar</span>
            </label>
          </div>

          {uploadSuccess && (
            <p className="mt-2 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{uploadSuccess}</p>
          )}
          {editError && (
            <p className="mt-2 text-[10px] font-medium text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{editError}</p>
          )}

          <div className="mt-3 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
            <button type="button" onClick={onEditCancel} disabled={editingSaving}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-medium text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
              Vazgeç
            </button>
            <button type="button" onClick={() => onEditSave(car.id)} disabled={editingSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#111827] px-3 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40">
              {editingSaving && (
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {editingSaving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      )}

      {/* Alt: ID */}
      <div className="mt-3 border-t border-gray-50 pt-2 text-right">
        <span className="text-[9px] font-mono text-gray-300">#{car.id}</span>
      </div>
    </div>
  );
}
