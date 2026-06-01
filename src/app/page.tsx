"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/ui/Navbar";
import BorsaTicker from "@/components/ui/BorsaTicker";
import FilterPanel, { type Filters } from "@/components/ui/FilterPanel";
import CarCard from "@/components/ui/CarCard";
import SancakTokModal from "@/components/ui/SancakTokModal";
import AracSatFormu from "@/components/ui/AracSatFormu";
import AdminLeadPanel from "@/components/ui/AdminLeadPanel";
import type { Car, LeadBuying, LeadStatus } from "@/types";

/* ======================================================================== */
/*  PAGE                                                                     */
/* ======================================================================== */

export default function Home() {
  const [activeTab, setActiveTab] = useState<"vitrin" | "sat">("vitrin");

  // Vitrin state
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tok state
  const [tokOpen, setTokOpen] = useState(false);
  const [tokStartIndex, setTokStartIndex] = useState(0);

  // Lead state
  const [leads, setLeads] = useState<LeadBuying[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);

  // Karşılaştırma
  const [comparedIds, setComparedIds] = useState<string[]>([]);

  // Filtre state
  const [filters, setFilters] = useState<Filters>({
    brand: "", segment: "", priceMin: "", priceMax: "",
    yearMin: "", yearMax: "", kmMin: "", kmMax: "", status: "",
  });
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "newest">("newest");

  /* ── Supabase'den araçları çek ── */
  useEffect(() => {
    async function fetchCars() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) {
        setError(err.message);
        setCars([]);
      } else {
        setCars((data as Car[]) ?? []);
      }
      setLoading(false);
    }
    fetchCars();
  }, []);

  /* ── Supabase'den lead'leri çek ── */
  useEffect(() => {
    async function fetchLeads() {
      setLeadsLoading(true);
      const { data, error: err } = await supabase
        .from("leads_buying")
        .select("*")
        .order("created_at", { ascending: false });

      if (!err) {
        setLeads((data as LeadBuying[]) ?? []);
      }
      setLeadsLoading(false);
    }
    fetchLeads();
  }, []);

  /* ── Filtreleme ── */
  const filteredCars = useMemo(() => {
    let list = [...cars];
    if (filters.brand) list = list.filter((c) => c.brand.toLowerCase().includes(filters.brand.toLowerCase()));
    if (filters.segment) list = list.filter((c) => c.segment === filters.segment);
    if (filters.priceMin) list = list.filter((c) => c.price >= Number(filters.priceMin));
    if (filters.priceMax) list = list.filter((c) => c.price <= Number(filters.priceMax));
    if (filters.yearMin) list = list.filter((c) => c.year >= Number(filters.yearMin));
    if (filters.yearMax) list = list.filter((c) => c.year <= Number(filters.yearMax));
    if (filters.kmMin) list = list.filter((c) => c.km >= Number(filters.kmMin));
    if (filters.kmMax) list = list.filter((c) => c.km <= Number(filters.kmMax));
    if (filters.status) list = list.filter((c) => c.status === filters.status);

    if (sortBy === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return list;
  }, [cars, filters, sortBy]);

  const tokCars = useMemo(() => cars.filter((c) => c.status !== "Satıldı"), [cars]);

  /* ── Callback'ler ── */
  const openTok = useCallback((index: number = 0) => {
    setTokStartIndex(index);
    setTokOpen(true);
  }, []);

  const handleNewLead = useCallback((lead: LeadBuying) => {
    setLeads((prev) => [lead, ...prev]);
  }, []);

  const handleLeadStatusChange = useCallback((id: string, newStatus: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
  }, []);

  const handleCompare = useCallback((id: string, checked: boolean) => {
    setComparedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  }, []);

  const pendingCount = leads.filter((l) => l.status === "Bekliyor").length;

  /* ── Shimmer iskelet kart ── */
  const ShimmerCard = () => (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white overflow-hidden">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg" />
          ))}
        </div>
        <div className="h-px bg-gray-100" />
        <div className="h-6 w-1/2 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="flex-1 h-9 bg-gray-200 rounded-lg" />
          <div className="h-9 w-9 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f9fafb]">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <BorsaTicker />

      {/* ─── VİTRİN ─── */}
      {activeTab === "vitrin" && (
        <section className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">Araç Listesi</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                {loading ? (
                  <span className="text-gray-400">Yükleniyor...</span>
                ) : (
                  <><span className="font-semibold text-[#111827]">{filteredCars.length}</span> araç bulundu</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 outline-none focus:border-[#111827]"
              >
                <option value="newest">En Yeni</option>
                <option value="price_asc">Fiyat (Artan)</option>
                <option value="price_desc">Fiyat (Azalan)</option>
              </select>
              {!loading && (
                <button
                  type="button"
                  onClick={() => openTok(0)}
                  className="rounded-lg bg-[#111827] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-800"
                >
                  Sancak Tok ({tokCars.length})
                </button>
              )}
            </div>
          </div>

          {/* Hata durumu */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Araçlar yüklenirken bir hata oluştu: {error}
            </div>
          )}

          <div className="flex flex-col gap-6 md:flex-row">
            {/* Filtre Paneli */}
            {!loading && !error && (
              <div className="w-full shrink-0 md:w-64">
                <FilterPanel
                  filters={filters}
                  onChange={setFilters}
                  onApply={() => {}}
                  carCount={filteredCars.length}
                />
              </div>
            )}

            {/* Araç Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <ShimmerCard key={i} />
                  ))}
                </div>
              ) : error ? null : filteredCars.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-24 text-gray-400">
                  <p className="text-sm">Filtrelere uygun araç bulunamadı.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCars.map((car, idx) => (
                    <CarCard
                      key={car.id}
                      car={car}
                      onCompare={handleCompare}
                      isCompared={comparedIds.includes(car.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── ARACINI SAT ─── */}
      {activeTab === "sat" && (
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <AracSatFormu onAddLead={handleNewLead} />
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs text-gray-400">Yönetim Paneli (Admin)</span>
                {pendingCount > 0 && (
                  <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{pendingCount}</span>
                )}
              </div>
              {leadsLoading ? (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
                  <div className="h-4 w-1/3 bg-gray-200 rounded mb-4" />
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-2 mb-4">
                      <div className="h-4 w-1/2 bg-gray-200 rounded" />
                      <div className="h-3 w-2/3 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <AdminLeadPanel leads={leads} onStatusChange={handleLeadStatusChange} />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        <p>Sancaktar Otomotiv &copy; {new Date().getFullYear()} &mdash; 750 Araçlık Vitrin</p>
      </footer>

      {/* Sancak Tok FAB */}
      {!loading && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => openTok(0)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111827] text-white shadow-lg transition-all hover:scale-110 active:scale-95"
            aria-label="Sancak Tok"
          >
            <span className="relative flex items-center justify-center text-xl">
              ▶
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-green-400" />
            </span>
          </button>
        </div>
      )}

      <SancakTokModal
        open={tokOpen}
        onClose={() => setTokOpen(false)}
        cars={tokCars}
        initialIndex={tokStartIndex}
      />
    </main>
  );
}
