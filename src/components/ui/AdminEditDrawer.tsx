"use client";

import type { Car } from "@/types";
import type { FormData } from "./AdminVehicleCard";
import AdminEkspertizPanel, { DEFAULT_EKSPERTIZ } from "./AdminEkspertizPanel";
import type { EkspertizData } from "@/types";

const inputCls = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#111827] outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-[#111827]/10";
const labelCls = "mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-400";

interface Props {
  car: Car | null;
  form: FormData;
  saving: boolean;
  error: string | null;
  addingImage: boolean;
  onClose: () => void;
  onChange: (field: keyof FormData, value: string) => void;
  onEkspertizChange: (data: EkspertizData) => void;
  onSave: (carId: string) => void;
  onAddImage: (carId: string, file: File) => void;
  onRemoveImage: (carId: string, imageUrl: string) => void;
}

export default function AdminEditDrawer({
  car, form, saving, error, addingImage,
  onClose, onChange, onEkspertizChange, onSave, onAddImage, onRemoveImage,
}: Props) {
  if (!car) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Düzenle</p>
            <h2 className="text-base font-black text-[#111827]">{car.brand} {car.model}</h2>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-700 transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scroll body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Fotoğraflar */}
          <div>
            <p className={labelCls}>Fotoğraflar</p>
            <div className="flex flex-wrap gap-2">
              {(car.images ?? []).map((url, i) => (
                <div key={url} className="group/img relative h-20 w-28 overflow-hidden rounded-xl border border-gray-200">
                  <img src={url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => onRemoveImage(car.id, url)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover/img:opacity-100 shadow-sm">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">Kapak</span>
                  )}
                </div>
              ))}
              <label className={`relative flex h-20 w-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 transition-all hover:border-gray-400 hover:text-gray-600 ${addingImage ? "opacity-50 pointer-events-none" : ""}`}>
                <input type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0"
                  disabled={addingImage}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onAddImage(car.id, file);
                    e.currentTarget.value = "";
                  }} />
                {addingImage ? (
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M12 5v14m-7-7h14" />
                    </svg>
                    <span className="mt-1 text-[10px] font-semibold">Ekle</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* 2-col grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Marka *</label>
              <input type="text" value={form.brand} onChange={(e) => onChange("brand", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Model *</label>
              <input type="text" value={form.model} onChange={(e) => onChange("model", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Yıl</label>
              <input type="text" value={form.year} onChange={(e) => onChange("year", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Fiyat (₺) *</label>
              <input type="text" value={form.price} onChange={(e) => onChange("price", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>KM</label>
              <input type="text" value={form.km} onChange={(e) => onChange("km", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Yakıt</label>
              <select value={form.fuel_type} onChange={(e) => onChange("fuel_type", e.target.value)} className={inputCls}>
                {["Benzin", "Dizel", "Elektrik", "Hibrit", "LPG"].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Vites</label>
              <select value={form.transmission} onChange={(e) => onChange("transmission", e.target.value)} className={inputCls}>
                {["Otomatik", "Manuel", "Yarı Otomatik"].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Segment</label>
              <select value={form.segment} onChange={(e) => onChange("segment", e.target.value)} className={inputCls}>
                <option value="Kelepir">Fırsat</option>
                <option value="Orta Direk">Orta Segment</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Durum</label>
              <select value={form.status} onChange={(e) => onChange("status", e.target.value)} className={inputCls}>
                <option value="Aktif">Aktif</option>
                <option value="Kaporalandı">Kaporalandı</option>
                <option value="Satıldı">Satıldı</option>
                <option value="Yayından Kaldırıldı">Yayından Kaldırıldı</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={form.is_featured}
                  onChange={(e) => onChange("is_featured", e.target.checked ? "true" : "false")}
                  className="h-4 w-4 rounded border-gray-300 text-amber-500 accent-amber-500" />
                <span className="text-sm font-medium text-gray-600 select-none">Vitrine çıkar</span>
              </label>
            </div>
          </div>

          {/* Ekspertiz Durumu */}
          <div>
            <label className={labelCls}>Ekspertiz Durumu</label>
            <AdminEkspertizPanel
              value={form.ekspertiz_durumu ?? DEFAULT_EKSPERTIZ}
              onChange={onEkspertizChange}
            />
          </div>

          {/* Video URL */}
          <div>
            <label className={labelCls}>Video URL</label>
            <input type="text" value={form.video_url} onChange={(e) => onChange("video_url", e.target.value)}
              placeholder="https://... (SancakTok'ta oynatılır)"
              className={inputCls} />
          </div>

          {/* Esnaf Notu */}
          <div>
            <label className={labelCls}>Esnaf Notu</label>
            <textarea rows={3} value={form.esnaf_notu} onChange={(e) => onChange("esnaf_notu", e.target.value)}
              placeholder="Anıl'ın aracı ile ilgili notu..."
              className={`${inputCls} resize-none`} />
          </div>

          {error && (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
          <a href={`/ilan/${car.id}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-blue-600 transition-colors">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            İlanı Gör
          </a>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} disabled={saving}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40">
              Vazgeç
            </button>
            <button type="button" onClick={() => onSave(car.id)} disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-5 py-2 text-sm font-bold text-white hover:bg-gray-800 transition-colors disabled:opacity-40 active:scale-[0.97]">
              {saving && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
