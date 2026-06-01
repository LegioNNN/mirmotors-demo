"use client";

import { useState } from "react";

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
/*  Accordion bölümü                                                         */
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
    <div className="border-b border-gray-100 py-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-[#111827]"
      >
        {title}
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="mt-2 space-y-2">{children}</div>}
    </div>
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

  const segments = ["Kelepir", "Orta Direk", "Premium", "Yayla Kan"];
  const statuses = ["Aktif", "Opsiyonlu", "Satıldı"];

  return (
    <aside className="w-full shrink-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:w-64">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#111827]">Filtrele</h2>
        <button
          type="button"
          onClick={() => onChange(defaultFilters)}
          className="text-[11px] font-medium text-gray-400 hover:text-gray-700"
        >
          Temizle
        </button>
      </div>

      {/* Marka */}
      <AccordionSection title="Marka" open={openSections.brand} onToggle={() => toggle("brand")}>
        <input
          type="text"
          value={filters.brand}
          onChange={(e) => set("brand", e.target.value)}
          placeholder="Marka ara..."
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-[#111827] placeholder-gray-400 outline-none focus:border-[#111827]"
        />
      </AccordionSection>

      {/* Segment */}
      <AccordionSection title="Segment" open={openSections.segment} onToggle={() => toggle("segment")}>
        <div className="flex flex-wrap gap-1.5">
          {segments.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set("segment", filters.segment === s ? "" : s)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                filters.segment === s
                  ? "border-[#111827] bg-[#111827] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </AccordionSection>

      {/* Fiyat */}
      <AccordionSection title="Fiyat (₺)" open={openSections.price} onToggle={() => toggle("price")}>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={filters.priceMin}
            onChange={(e) => set("priceMin", e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Min"
            className="w-1/2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-[#111827] placeholder-gray-400 outline-none focus:border-[#111827]"
          />
          <input
            type="text"
            inputMode="numeric"
            value={filters.priceMax}
            onChange={(e) => set("priceMax", e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Maks"
            className="w-1/2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-[#111827] placeholder-gray-400 outline-none focus:border-[#111827]"
          />
        </div>
      </AccordionSection>

      {/* Yıl */}
      <AccordionSection title="Yıl" open={openSections.year} onToggle={() => toggle("year")}>
        <div className="flex gap-2">
          <input
            type="number"
            value={filters.yearMin}
            onChange={(e) => set("yearMin", e.target.value)}
            placeholder="Min"
            className="w-1/2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-[#111827] placeholder-gray-400 outline-none focus:border-[#111827]"
          />
          <input
            type="number"
            value={filters.yearMax}
            onChange={(e) => set("yearMax", e.target.value)}
            placeholder="Maks"
            className="w-1/2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-[#111827] placeholder-gray-400 outline-none focus:border-[#111827]"
          />
        </div>
      </AccordionSection>

      {/* KM */}
      <AccordionSection title="Kilometre" open={openSections.km} onToggle={() => toggle("km")}>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={filters.kmMin}
            onChange={(e) => set("kmMin", e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Min"
            className="w-1/2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-[#111827] placeholder-gray-400 outline-none focus:border-[#111827]"
          />
          <input
            type="text"
            inputMode="numeric"
            value={filters.kmMax}
            onChange={(e) => set("kmMax", e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Maks"
            className="w-1/2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-[#111827] placeholder-gray-400 outline-none focus:border-[#111827]"
          />
        </div>
      </AccordionSection>

      {/* Durum */}
      <AccordionSection title="Durum" open={openSections.status} onToggle={() => toggle("status")}>
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set("status", filters.status === s ? "" : s)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                filters.status === s
                  ? "border-[#111827] bg-[#111827] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </AccordionSection>

      {/* Uygula */}
      <button
        type="button"
        onClick={onApply}
        className="mt-4 w-full rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-green-600"
      >
        Filtrele ({carCount} araç)
      </button>
    </aside>
  );
}
