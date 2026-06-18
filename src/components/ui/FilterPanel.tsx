"use client";

import { useState, useMemo } from "react";

/* -------------------------------------------------------------------------- */
/*  Tip                                                                       */
/* -------------------------------------------------------------------------- */

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
}

const defaultFilters: Filters = {
  brand: "",
  segment: "",
  priceMin: "",
  priceMax: "",
  yearMin: "",
  yearMax: "",
  kmMin: "",
  kmMax: "",
  status: "",
};

/* -------------------------------------------------------------------------- */
/*  Accordion bolumu                                                         */
/* -------------------------------------------------------------------------- */

function AccordionSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-100 last:border-b-0 py-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</span>
        <svg
          className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="mt-3 space-y-2.5">{children}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  MinMaxInput                                                               */
/* -------------------------------------------------------------------------- */

function MinMaxInput({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minPlaceholder = "Min",
  maxPlaceholder = "Maks",
  suffix,
}: {
  minValue: string;
  maxValue: string;
  onMinChange: (val: string) => void;
  onMaxChange: (val: string) => void;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          inputMode="numeric"
          value={minValue}
          onChange={(e) => onMinChange(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder={minPlaceholder}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs font-medium text-[#111827] placeholder-gray-400 outline-none transition-colors focus:border-[#111827] focus:bg-white focus:ring-1 focus:ring-gray-900/10"
        />
      </div>
      <span className="text-xs font-medium text-gray-300">&mdash;</span>
      <div className="relative flex-1">
        <input
          type="text"
          inputMode="numeric"
          value={maxValue}
          onChange={(e) => onMaxChange(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder={maxPlaceholder}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs font-medium text-[#111827] placeholder-gray-400 outline-none transition-colors focus:border-[#111827] focus:bg-white focus:ring-1 focus:ring-gray-900/10"
        />
      </div>
      {suffix && (
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-gray-400 w-6 text-right">
          {suffix}
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ChipSelect                                                                */
/* -------------------------------------------------------------------------- */

function ChipSelect({
  options,
  selected,
  onSelect,
}: {
  options: { value: string; label: string; color?: string }[];
  selected: string;
  onSelect: (val: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const isActive = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(isActive ? "" : opt.value)}
            className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all duration-150 ${
              isActive
                ? opt.color
                  ? `${opt.color} text-white shadow-sm`
                  : "border-[#111827] bg-[#111827] text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ActiveFilterBadge - secili filtre rozeti                                  */
/* -------------------------------------------------------------------------- */

function ActiveFilterBadge({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-medium text-gray-600">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
      >
        <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Filtre Paneli                                                             */
/* -------------------------------------------------------------------------- */

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onApply: () => void;
  carCount: number;
}

export default function FilterPanel({ filters, onChange, onApply, carCount }: FilterPanelProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    brand: true,
    segment: true,
    price: false,
    year: false,
    km: false,
    status: false,
  });

  const toggle = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const set = (key: keyof Filters, val: string) =>
    onChange({ ...filters, [key]: val });

  const segmentOptions = [
    { value: "Kelepir", label: "Fırsat", color: "bg-emerald-600 border-emerald-600" },
    { value: "Yayla Kan", label: "Ekonomik", color: "bg-slate-600 border-slate-600" },
    { value: "Orta Direk", label: "Orta Segment", color: "bg-indigo-700 border-indigo-700" },
    { value: "Premium", label: "Premium", color: "bg-slate-900 border-slate-900" },
  ];

  const statusOptions = [
    { value: "Aktif", label: "Aktif", color: "bg-green-700 border-green-700" },
    { value: "Kaporalandı", label: "Kaporalandı", color: "bg-amber-600 border-amber-600" },
    { value: "Satıldı", label: "Satıldı", color: "bg-red-600 border-red-600" },
  ];

  /* --- Aktif filtre rozetleri --- */
  const activeFilters = useMemo(() => {
    const list: { label: string; onRemove: () => void }[] = [];
    if (filters.brand) list.push({ label: `Marka: ${filters.brand}`, onRemove: () => set("brand", "") });
    if (filters.segment) list.push({ label: `Segment: ${filters.segment}`, onRemove: () => set("segment", "") });
    if (filters.priceMin) list.push({ label: `Fiyat min: ${Number(filters.priceMin).toLocaleString("tr-TR")}`, onRemove: () => set("priceMin", "") });
    if (filters.priceMax) list.push({ label: `Fiyat max: ${Number(filters.priceMax).toLocaleString("tr-TR")}`, onRemove: () => set("priceMax", "") });
    if (filters.yearMin) list.push({ label: `Yıl min: ${filters.yearMin}`, onRemove: () => set("yearMin", "") });
    if (filters.yearMax) list.push({ label: `Yıl max: ${filters.yearMax}`, onRemove: () => set("yearMax", "") });
    if (filters.status) list.push({ label: `Durum: ${filters.status}`, onRemove: () => set("status", "") });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const hasAnyFilter = Object.values(filters).some((v) => v !== "");

  return (
    <aside className="w-full shrink-0 rounded-xl border border-gray-200 bg-white shadow-sm md:w-64">
      {/* Baslik */}
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-[#111827]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <h2 className="text-sm font-bold text-[#111827]">Detaylı Araç Arama</h2>
          </div>
          {hasAnyFilter && (
            <button
              type="button"
              onClick={() => onChange(defaultFilters)}
              className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 transition-colors hover:text-gray-700"
            >
              Temizle
            </button>
          )}
        </div>
      </div>

      <div className="px-5 pb-5">
        {/* Marka/Model arama */}
        <div className="relative mt-4">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={filters.brand}
            onChange={(e) => set("brand", e.target.value)}
            placeholder="Marka veya model ara..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-xs font-medium text-[#111827] placeholder-gray-400 outline-none transition-colors focus:border-[#111827] focus:bg-white focus:ring-1 focus:ring-gray-900/10"
          />
        </div>

        {/* Aktif filtre rozetleri */}
        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {activeFilters.map((af, idx) => (
              <ActiveFilterBadge key={idx} label={af.label} onRemove={af.onRemove} />
            ))}
          </div>
        )}

        {/* Accordion filtreler */}
        <div className="mt-2 divide-y divide-gray-100">
          {/* Segment */}
          <AccordionSection title="Segment" open={openSections.segment} onToggle={() => toggle("segment")}>
            <ChipSelect options={segmentOptions} selected={filters.segment} onSelect={(v) => set("segment", v)} />
          </AccordionSection>

          {/* Fiyat Aralığı */}
          <AccordionSection title="Fiyat Aralığı" open={openSections.price} onToggle={() => toggle("price")}>
            <MinMaxInput
              minValue={filters.priceMin}
              maxValue={filters.priceMax}
              onMinChange={(v) => set("priceMin", v)}
              onMaxChange={(v) => set("priceMax", v)}
              minPlaceholder="0"
              maxPlaceholder="10.000.000"
              suffix="TL"
            />
          </AccordionSection>

          {/* Model Yılı */}
          <AccordionSection title="Model Yılı" open={openSections.year} onToggle={() => toggle("year")}>
            <MinMaxInput
              minValue={filters.yearMin}
              maxValue={filters.yearMax}
              onMinChange={(v) => set("yearMin", v)}
              onMaxChange={(v) => set("yearMax", v)}
              minPlaceholder="2010"
              maxPlaceholder="2025"
            />
          </AccordionSection>

          {/* Durum */}
          <AccordionSection title="Durum" open={openSections.status} onToggle={() => toggle("status")}>
            <ChipSelect options={statusOptions} selected={filters.status} onSelect={(v) => set("status", v)} />
          </AccordionSection>
        </div>

        {/* Filtrele butonu */}
        <button
          type="button"
          onClick={onApply}
          className="mt-5 w-full rounded-lg bg-gradient-to-r from-[#1a2332] to-[#111827] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:from-[#111827] hover:to-gray-800 hover:shadow-md active:scale-[0.98]"
        >
          Filtrele ({carCount} araç)
        </button>
      </div>
    </aside>
  );
}
