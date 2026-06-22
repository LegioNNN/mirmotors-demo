"use client";

import { useState } from "react";

export interface Filters {
  brand: string;
  segment: string;
  priceMin: string;
  priceMax: string;
  yearMin: string;
  yearMax: string;
  kmMin: string;
  kmMax: string;
  status: string;
  fuelType: string;
  transmission: string;
}

export const defaultFilters: Filters = {
  brand: "", segment: "", priceMin: "", priceMax: "",
  yearMin: "", yearMax: "", kmMin: "", kmMax: "", status: "",
  fuelType: "", transmission: "",
};

/* -------------------------------------------------------------------------- */
/*  Sabit veriler                                                               */
/* -------------------------------------------------------------------------- */

const POPULAR_BRANDS = [
  "Dacia", "Renault", "Fiat", "Ford", "Toyota",
];

const PRICE_PRESETS = [
  { label: "100K altı", min: "", max: "100000" },
  { label: "100–250K", min: "100000", max: "250000" },
  { label: "250–500K", min: "250000", max: "500000" },
  { label: "500K–1M", min: "500000", max: "1000000" },
  { label: "1M+", min: "1000000", max: "" },
];

const KM_PRESETS = [
  { label: "0–100K", min: "0", max: "100000" },
  { label: "100–200K", min: "100000", max: "200000" },
  { label: "200K+", min: "200000", max: "" },
];

const SEGMENT_OPTIONS = [
  { value: "Kelepir", label: "Fırsat", emoji: "🟢" },
  { value: "Yayla Kan", label: "Ekonomik", emoji: "💙" },
  { value: "Orta Direk", label: "Orta", emoji: "⚪" },
  { value: "Premium", label: "Premium", emoji: "⭐" },
];

const STATUS_OPTIONS = [
  { value: "Aktif", label: "Satışta", emoji: "✅" },
  { value: "Kaporalandı", label: "Kaporalı", emoji: "⚡" },
  { value: "Satıldı", label: "Satıldı", emoji: "💰" },
];

const FUEL_OPTIONS = [
  { value: "Dizel", label: "Dizel" },
  { value: "Benzin", label: "Benzin" },
  { value: "Hibrit", label: "Hibrit" },
  { value: "Elektrik", label: "Elektrik" },
  { value: "LPG", label: "LPG" },
];

const TRANSMISSION_OPTIONS = [
  { value: "Manuel", label: "Manuel" },
  { value: "Otomatik", label: "Otomatik" },
  { value: "Yarı Otomatik", label: "Yarı Oto" },
];

/* -------------------------------------------------------------------------- */
/*  Yardımcı bileşenler                                                        */
/* -------------------------------------------------------------------------- */

function SectionHeader({ title, active, open, onToggle }: {
  title: string; active: boolean; open: boolean; onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between py-3 text-left"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-600">{title}</span>
        {active && <span className="h-1.5 w-1.5 rounded-full bg-[#111827]" />}
      </div>
      <svg
        className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

function ChipRow({ options, selected, onSelect, multiSelect = false }: {
  options: { value: string; label: string; emoji?: string }[];
  selected: string;
  onSelect: (v: string) => void;
  multiSelect?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(active ? "" : opt.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
              active
                ? "border-[#111827] bg-[#111827] text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {opt.emoji && <span className="mr-1">{opt.emoji}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function PresetRow({ presets, activeMin, activeMax, onSelect }: {
  presets: { label: string; min: string; max: string }[];
  activeMin: string;
  activeMax: string;
  onSelect: (min: string, max: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {presets.map((p) => {
        const active = activeMin === p.min && activeMax === p.max;
        return (
          <button
            key={p.label}
            type="button"
            onClick={() => onSelect(active ? "" : p.min, active ? "" : p.max)}
            className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all active:scale-95 ${
              active
                ? "border-[#111827] bg-[#111827] text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

function RangeInputs({ minVal, maxVal, onMinChange, onMaxChange, minPh, maxPh }: {
  minVal: string; maxVal: string;
  onMinChange: (v: string) => void; onMaxChange: (v: string) => void;
  minPh: string; maxPh: string;
}) {
  return (
    <div className="mt-2.5 flex items-center gap-2">
      <input
        type="text" inputMode="numeric" value={minVal}
        onChange={(e) => onMinChange(e.target.value.replace(/\D/g, ""))}
        placeholder={minPh}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-[#111827] placeholder-gray-400 outline-none focus:border-[#111827] focus:bg-white"
      />
      <span className="shrink-0 text-gray-300">—</span>
      <input
        type="text" inputMode="numeric" value={maxVal}
        onChange={(e) => onMaxChange(e.target.value.replace(/\D/g, ""))}
        placeholder={maxPh}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-[#111827] placeholder-gray-400 outline-none focus:border-[#111827] focus:bg-white"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Aktif filtre etiketi                                                        */
/* -------------------------------------------------------------------------- */

function ActiveTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-[#111827] px-2.5 py-1 text-[11px] font-semibold text-white">
      {label}
      <button type="button" onClick={onRemove} className="ml-0.5 rounded-full hover:opacity-70">
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Ana içerik                                                                  */
/* -------------------------------------------------------------------------- */

function FilterContent({ filters, onChange, onApply, carCount, onDone }: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onApply: () => void;
  carCount: number;
  onDone?: () => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    brand: true, segment: true, price: false, year: false, km: false,
    fuel: false, transmission: false, status: false,
  });
  const toggle = (k: string) => setOpen((p) => ({ ...p, [k]: !p[k] }));
  const set = (key: keyof Filters, val: string) => onChange({ ...filters, [key]: val });
  const reset = () => onChange(defaultFilters);

  const activeCount = Object.values(filters).filter((v) => v !== "").length;

  /* Aktif filtre etiketleri */
  const activeTags: { label: string; clear: () => void }[] = [];
  if (filters.brand) activeTags.push({ label: filters.brand, clear: () => set("brand", "") });
  if (filters.segment) activeTags.push({ label: filters.segment, clear: () => set("segment", "") });
  if (filters.status) activeTags.push({ label: filters.status, clear: () => set("status", "") });
  if (filters.fuelType) activeTags.push({ label: filters.fuelType, clear: () => set("fuelType", "") });
  if (filters.transmission) activeTags.push({ label: filters.transmission, clear: () => set("transmission", "") });
  if (filters.priceMin || filters.priceMax) activeTags.push({
    label: `${filters.priceMin || "0"} – ${filters.priceMax || "∞"} TL`,
    clear: () => onChange({ ...filters, priceMin: "", priceMax: "" }),
  });
  if (filters.kmMin || filters.kmMax) activeTags.push({
    label: `${filters.kmMin || "0"} – ${filters.kmMax || "∞"} km`,
    clear: () => onChange({ ...filters, kmMin: "", kmMax: "" }),
  });
  if (filters.yearMin || filters.yearMax) activeTags.push({
    label: `${filters.yearMin || "–"} / ${filters.yearMax || "–"}`,
    clear: () => onChange({ ...filters, yearMin: "", yearMax: "" }),
  });

  return (
    <div className="flex flex-col">
      {/* Başlık */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-[#111827]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          <span className="text-sm font-bold text-[#111827]">Filtrele</span>
          {activeCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#111827] text-[9px] font-black text-white">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button type="button" onClick={reset} className="text-xs font-bold text-red-500 hover:text-red-600">
            Temizle
          </button>
        )}
      </div>

      {/* Scroll alanı */}
      <div className="px-5 pb-6">

        {/* Aktif filtreler */}
        {activeTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {activeTags.map((t, i) => (
              <ActiveTag key={i} label={t.label} onRemove={t.clear} />
            ))}
          </div>
        )}

        {/* Marka arama */}
        <div className="mt-4 border-b border-gray-100 pb-3">
          <SectionHeader
            title="Marka"
            active={!!filters.brand}
            open={open.brand}
            onToggle={() => toggle("brand")}
          />
          {open.brand && (
            <div className="space-y-3">
              {/* Arama kutusu */}
              <div className="relative">
                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={filters.brand}
                  onChange={(e) => set("brand", e.target.value)}
                  placeholder="Marka veya model ara..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-[#111827] placeholder-gray-400 outline-none focus:border-[#111827] focus:bg-white"
                />
                {filters.brand && (
                  <button type="button" onClick={() => set("brand", "")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
              {/* Popüler markalar */}
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Popüler</p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_BRANDS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => set("brand", filters.brand === b ? "" : b)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all active:scale-95 ${
                        filters.brand === b
                          ? "border-[#111827] bg-[#111827] text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Segment */}
        <div className="border-b border-gray-100 pb-3">
          <SectionHeader title="Segment" active={!!filters.segment} open={open.segment} onToggle={() => toggle("segment")} />
          {open.segment && (
            <ChipRow options={SEGMENT_OPTIONS} selected={filters.segment} onSelect={(v) => set("segment", v)} />
          )}
        </div>

        {/* Durum */}
        <div className="border-b border-gray-100 pb-3">
          <SectionHeader title="Durum" active={!!filters.status} open={open.status} onToggle={() => toggle("status")} />
          {open.status && (
            <ChipRow options={STATUS_OPTIONS} selected={filters.status} onSelect={(v) => set("status", v)} />
          )}
        </div>

        {/* Fiyat */}
        <div className="border-b border-gray-100 pb-3">
          <SectionHeader
            title="Fiyat (TL)"
            active={!!(filters.priceMin || filters.priceMax)}
            open={open.price}
            onToggle={() => toggle("price")}
          />
          {open.price && (
            <div className="space-y-2.5">
              <PresetRow
                presets={PRICE_PRESETS}
                activeMin={filters.priceMin}
                activeMax={filters.priceMax}
                onSelect={(min, max) => onChange({ ...filters, priceMin: min, priceMax: max })}
              />
              <RangeInputs
                minVal={filters.priceMin} maxVal={filters.priceMax}
                onMinChange={(v) => set("priceMin", v)} onMaxChange={(v) => set("priceMax", v)}
                minPh="Min TL" maxPh="Max TL"
              />
            </div>
          )}
        </div>

        {/* Yakıt */}
        <div className="border-b border-gray-100 pb-3">
          <SectionHeader title="Yakıt" active={!!filters.fuelType} open={open.fuel} onToggle={() => toggle("fuel")} />
          {open.fuel && (
            <ChipRow options={FUEL_OPTIONS} selected={filters.fuelType} onSelect={(v) => set("fuelType", v)} />
          )}
        </div>

        {/* Vites */}
        <div className="border-b border-gray-100 pb-3">
          <SectionHeader title="Vites" active={!!filters.transmission} open={open.transmission} onToggle={() => toggle("transmission")} />
          {open.transmission && (
            <ChipRow options={TRANSMISSION_OPTIONS} selected={filters.transmission} onSelect={(v) => set("transmission", v)} />
          )}
        </div>

        {/* Kilometre */}
        <div className="border-b border-gray-100 pb-3">
          <SectionHeader
            title="Kilometre"
            active={!!(filters.kmMin || filters.kmMax)}
            open={open.km}
            onToggle={() => toggle("km")}
          />
          {open.km && (
            <div className="space-y-2.5">
              <PresetRow
                presets={KM_PRESETS}
                activeMin={filters.kmMin}
                activeMax={filters.kmMax}
                onSelect={(min, max) => onChange({ ...filters, kmMin: min, kmMax: max })}
              />
              <RangeInputs
                minVal={filters.kmMin} maxVal={filters.kmMax}
                onMinChange={(v) => set("kmMin", v)} onMaxChange={(v) => set("kmMax", v)}
                minPh="Min km" maxPh="Max km"
              />
            </div>
          )}
        </div>

        {/* Model Yılı */}
        <div className="pb-3">
          <SectionHeader
            title="Model Yılı"
            active={!!(filters.yearMin || filters.yearMax)}
            open={open.year}
            onToggle={() => toggle("year")}
          />
          {open.year && (
            <RangeInputs
              minVal={filters.yearMin} maxVal={filters.yearMax}
              onMinChange={(v) => set("yearMin", v)} onMaxChange={(v) => set("yearMax", v)}
              minPh="2005" maxPh="2025"
            />
          )}
        </div>

      </div>

      {/* Uygula */}
      <div className="shrink-0 border-t border-gray-100 px-5 py-4">
        <button
          type="button"
          onClick={() => { onApply(); onDone?.(); }}
          className="w-full rounded-xl bg-[#111827] py-3.5 text-sm font-bold text-white transition-colors hover:bg-gray-800 active:scale-[0.98]"
        >
          {carCount > 0 ? `${carCount} Araç Göster` : "Sonuç Bulunamadı"}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Export                                                                     */
/* -------------------------------------------------------------------------- */

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onApply: () => void;
  carCount: number;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onNotificationClick?: () => void;
}

export default function FilterPanel({ filters, onChange, onApply, carCount, mobileOpen = false, onMobileClose, onNotificationClick }: FilterPanelProps) {
  return (
    <>
      {/* Masaüstü sidebar */}
      <div className="hidden md:flex md:flex-col w-64 shrink-0 gap-3 sticky top-6 self-start">
        <aside className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-y-auto max-h-[calc(100vh-10rem)]">
          <FilterContent filters={filters} onChange={onChange} onApply={onApply} carCount={carCount} />
        </aside>

        {/* Mini harita kartı */}
        <a
          href="https://maps.app.goo.gl/USRs34mY3L6xNjT86"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md block"
        >
          <div className="relative h-32 w-full overflow-hidden pointer-events-none">
            <iframe
              src="https://www.google.com/maps?q=2GH8%2B2J+B%C3%BCy%C3%BCk%C3%A7ekmece%2C+%C4%B0stanbul&output=embed"
              width="100%"
              height="128"
              style={{ border: 0, marginBottom: -4 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Sancaktar Otomotiv Konum"
            />
            <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors" />
          </div>
          <div className="flex items-center justify-between px-3 py-2.5">
            <div>
              <p className="text-[11px] font-bold text-gray-700 leading-tight">Galeriyi canlı görmek ister misiniz?</p>
              <p className="mt-0.5 text-[10px] text-gray-400">Büyükçekmece, İstanbul</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 whitespace-nowrap">Rota Al →</span>
          </div>
        </a>

        {/* Bildirim Abone Ol Banner */}
        <div className="rounded-xl border border-blue-200 bg-gradient-to-b from-blue-50 to-blue-50/50 p-4 space-y-2.5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">📢 Bildir</p>
            <h3 className="mt-1 text-sm font-black text-[#111827]">Yeni araçlar eklendiğinde</h3>
            <p className="mt-0.5 text-xs text-gray-600">sana haber verebiliriz!</p>
          </div>
          <button
            type="button"
            onClick={onNotificationClick}
            className="w-full rounded-lg bg-blue-600 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700 active:scale-95"
          >
            Abone Ol
          </button>
        </div>

      </div>

      {/* Mobil bottom sheet */}
      <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${mobileOpen ? "visible" : "invisible pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={onMobileClose}
        />
        <div className={`absolute inset-x-0 bottom-0 flex max-h-[90vh] flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out ${mobileOpen ? "translate-y-0" : "translate-y-full"}`}>
          <div className="flex shrink-0 justify-center pb-1 pt-3">
            <div className="h-1 w-10 rounded-full bg-gray-300" />
          </div>
          <FilterContent filters={filters} onChange={onChange} onApply={onApply} carCount={carCount} onDone={onMobileClose} />
        </div>
      </div>
    </>
  );
}
