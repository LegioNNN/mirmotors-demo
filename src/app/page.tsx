"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getCarImage } from "@/utils/carImages";
import Navbar from "@/components/ui/Navbar";
import FilterPanel, { type Filters } from "@/components/ui/FilterPanel";
import CarCard from "@/components/ui/CarCard";
import SancakTokModal from "@/components/ui/SancakTokModal";
import AracSatFormu from "@/components/ui/AracSatFormu";
import AdminLeadPanel from "@/components/ui/AdminLeadPanel";
import type { Car, CarSegment, LeadBuying, LeadStatus } from "@/types";

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

  // Karsilastirma
  const [comparedIds, setComparedIds] = useState<string[]>([]);

  // Filtre state
  const [filters, setFilters] = useState<Filters>({
    brand: "", segment: "", priceMin: "", priceMax: "",
    yearMin: "", yearMax: "", kmMin: "", kmMax: "", status: "",
  });
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "newest">("newest");

  /* --- Supabase'den araclari cek --- */
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

  /* --- Supabase'den lead'leri cek --- */
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

  /* --- Filtreleme --- */
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

  /* --- One cikan arac (featured) --- */
  const featuredCar = useMemo(() => {
    const premiumCar = cars.find(
      (c) => c.segment === "Premium" && c.status !== "Satıldı"
    );
    return premiumCar ?? cars[0] ?? null;
  }, [cars]);

  /* --- Callback'ler --- */
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

  /* --- Shimmer iskelet kart --- */
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

      {activeTab === "vitrin" && (
        <>
          {/* ======================================================================== */}
          {/*  HERO ALANI                                                              */}
          {/* ======================================================================== */}
          <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#111827] to-[#1a2332]">
            {/* Arka plan deseni */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

            <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
              <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
                {/* --- SOL KOLON: Baslik + CTA --- */}
                <div className="lg:col-span-7">
                  {/* Rozet */}
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-medium text-green-400 backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    Istanbul Galeri &mdash; 750+ Araclik Stok
                  </div>

                  {/* Baslik */}
                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Sancaktar{" "}
                    <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                      Otomotiv
                    </span>
                  </h1>

                  {/* Alt baslik */}
                  <p className="mt-3 text-base font-medium text-gray-300 sm:text-lg">
                    Istanbul&rsquo;da 750+ aracilik guclu stok
                  </p>

                  {/* Aciklama */}
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-400 sm:text-sm">
                    Aradiginiz araci marka, model, fiyat, yil ve kilometreye gore
                    saniyeler icinde bulun. Her butceye uygun secenekler,
                    guvenilir ekspertiz ve hizli teslimat.
                  </p>

                  {/* CTA Butonlari */}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        document.getElementById("arac-listesi")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-green-600 hover:shadow-lg hover:shadow-green-700/25 active:scale-[0.97]"
                    >
                      Araclari Incele
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("sat")}
                      className="rounded-lg border border-gray-600 bg-white/5 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-gray-500 hover:bg-white/10 active:scale-[0.97]"
                    >
                      Aracini Sat / Takas Et
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-green-700/50 bg-green-900/20 px-5 py-2.5 text-sm font-bold text-green-400 backdrop-blur-sm transition-all hover:bg-green-900/30 hover:border-green-600 active:scale-[0.97]"
                    >
                      WhatsApp ile Iletisim
                    </button>
                  </div>

                  {/* Hizli ozellikler */}
                  <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Guvenilir Ekspertiz
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Hizli Teslimat
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Takas Imkani
                    </span>
                  </div>
                </div>

                {/* --- SAG KOLON: One Cikan Arac Karti --- */}
                <div className="lg:col-span-5">
                  <FeaturedCarCard car={featuredCar} />
                </div>
              </div>
            </div>
          </section>

          {/* ======================================================================== */}
          {/*  ISTATISTIK KARTLARI                                                      */}
          {/* ======================================================================== */}
          <section className="relative -mt-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <StatCard icon="🚘" value="750+" label="Guncel Stok" />
                <StatCard icon="⚡" value="24" label="Saat Hizli Donus" suffix=" Saat" />
                <StatCard icon="👥" value="5+" label="Satis Danismani" />
                <StatCard icon="📍" value="Istanbul" label="Galeri Lokasyonu" />
              </div>
            </div>
          </section>

          {/* ======================================================================== */}
          {/*  ARAC LISTESI                                                             */}
          {/* ======================================================================== */}
          <section id="arac-listesi" className="mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-[#111827] sm:text-3xl">
                  Sancaktar Arac Vitrini
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  750+ araclik stok yapisina uygun gelismis vitrin sistemi.
                </p>
                {!loading && (
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    Demo vitrinde su an {filteredCars.length} arac gosteriliyor.
                  </p>
                )}
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
                Araclar yuklenirken bir hata olustu: {error}
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

              {/* Arac Grid */}
              <div className="flex-1">
                {loading ? (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <ShimmerCard key={i} />
                    ))}
                  </div>
                ) : error ? null : filteredCars.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-24 text-gray-400">
                    <p className="text-sm">Filtrelere uygun arac bulunamadi.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCars.map((car) => (
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
        </>
      )}

      {/* --- ARACINI SAT --- */}
      {activeTab === "sat" && (
        <>
          <AracSatFormu onAddLead={handleNewLead} />
          <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs text-gray-400">Yonetim Paneli (Admin)</span>
              {pendingCount > 0 && (
                <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{pendingCount}</span>
              )}
            </div>
            {leadsLoading ? (
              <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 h-4 w-1/3 rounded bg-gray-200" />
                {[1, 2].map((i) => (
                  <div key={i} className="mb-4 space-y-2">
                    <div className="h-4 w-1/2 rounded bg-gray-200" />
                    <div className="h-3 w-2/3 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : (
              <AdminLeadPanel leads={leads} onStatusChange={handleLeadStatusChange} />
            )}
          </section>
        </>
      )}

      {/* ======================================================================== */}
      {/*  FOOTER                                                                  */}
      {/* ======================================================================== */}
      <footer className="bg-gradient-to-br from-[#0a0a0a] via-[#111827] to-[#1a2332] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {/* Sol - Sancaktar aciklamasi */}
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-700 to-green-600 shadow-sm">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
                    <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
                    <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-black tracking-tight text-white">SANCAKTAR</span>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-500">Otomotiv</span>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-gray-400 max-w-xs">
                Istanbul merkezli premium oto galeri. 750+ araclik guclu
                stok, guvenilir ekspertiz ve hizli teslimat ile
                aradiginiz araca en dogru sekilde ulasin.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500">
                  <svg className="h-3 w-3 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Guvenilir
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500">
                  <svg className="h-3 w-3 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Profesyonel
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500">
                  <svg className="h-3 w-3 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Hizli
                </span>
              </div>
            </div>

            {/* Orta - Hizli Linkler */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">Hizli Linkler</h3>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <button
                    onClick={() => setActiveTab("vitrin")}
                    className="text-xs font-medium text-gray-500 transition-colors hover:text-white"
                  >
                    Vitrin
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("sat")}
                    className="text-xs font-medium text-gray-500 transition-colors hover:text-white"
                  >
                    Aracini Bize Sat
                  </button>
                </li>
                <li>
                  <span className="text-xs font-medium text-gray-500 transition-colors hover:text-white cursor-pointer">
                    Hakkimizda
                  </span>
                </li>
                <li>
                  <span className="text-xs font-medium text-gray-500 transition-colors hover:text-white cursor-pointer">
                    Iletisim
                  </span>
                </li>
              </ul>
            </div>

            {/* Sag - Iletisim */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">Iletisim</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-2.5">
                  <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-xs font-medium text-gray-400">
                    Istanbul / Turkiye
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-400">
                    WhatsApp ile hizli iletisim
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-400">Hafta Ici: 09:00 - 19:00</span>
                    <span className="text-xs font-medium text-gray-500">Cumartesi: 10:00 - 17:00</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Alt copyright */}
          <div className="mt-10 border-t border-white/5 pt-6 text-center">
            <p className="text-[10px] font-medium text-gray-500">
              &copy; 2026 Sancaktar Otomotiv &mdash; Dijital Galeri Sistemi
            </p>
          </div>
        </div>
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
              &#9654;
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

/* ======================================================================== */
/*  FeaturedCarCard - One cikan arac karti (hero)                            */
/* ======================================================================== */
function FeaturedCarCard({ car }: { car: Car | null }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const displayCar = car ?? {
    id: "default",
    brand: "BMW",
    model: "320i M Sport",
    year: 2022,
    km: 22000,
    fuel_type: "Benzin",
    transmission: "Otomatik",
    price: 2850000,
    segment: "Premium" as CarSegment,
    status: "Aktif" as const,
    created_at: new Date().toISOString(),
  } as Car;

  const carImage = getCarImage(displayCar.id);

  const formatPriceInline = (n: number) =>
    new Intl.NumberFormat("tr-TR", { style: "decimal", minimumFractionDigits: 0 }).format(n);
  const formatKmInline = (n: number) => new Intl.NumberFormat("tr-TR").format(n);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-2xl backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-green-900/20">
      {/* Kart ustu - "One Cikan" etiketi */}
      <div className="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 backdrop-blur-sm">
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        One Cikan Arac
      </div>

      {/* Gorsel alani */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
        {!imgError && displayCar.id !== "default" ? (
          <>
            <img
              src={carImage}
              alt={`${displayCar.brand} ${displayCar.model}`}
              className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gray-800" />
            )}
            {/* Gradient overlay - metinler okunakli kalsin */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
          </>
        ) : (
          <>
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <svg className="h-16 w-16 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
                  <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
                  <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
                  <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
                </svg>
                <span className="text-[11px] font-medium uppercase tracking-widest text-gray-600">
                  {displayCar.brand} {displayCar.model}
                </span>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
          </>
        )}
      </div>

      {/* Kart icerigi */}
      <div className="p-5">
        <h3 className="text-base font-bold text-white">
          {displayCar.brand} {displayCar.model}
        </h3>
        <p className="mt-1 text-xs font-medium text-gray-400">
          {displayCar.year} &bull; {formatKmInline(displayCar.km)} KM &bull; {displayCar.fuel_type} &bull; {displayCar.transmission}
        </p>

        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-xl font-black tracking-tight text-white">
            {formatPriceInline(displayCar.price)}
          </span>
          <span className="text-sm font-bold text-gray-400">TL</span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {displayCar.id !== "default" ? (
            <Link
              href={`/ilan/${displayCar.id}`}
              className="flex-1 rounded-lg bg-gradient-to-r from-green-700 to-green-600 px-4 py-2.5 text-center text-xs font-bold text-white shadow-sm transition-all hover:shadow-md hover:from-green-600 hover:to-green-500 active:scale-[0.98] block"
            >
              Detaylari Incele
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                document.getElementById("arac-listesi")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex-1 rounded-lg bg-gradient-to-r from-green-700 to-green-600 px-4 py-2.5 text-center text-xs font-bold text-white shadow-sm transition-all hover:shadow-md hover:from-green-600 hover:to-green-500 active:scale-[0.98]"
            >
              Tum Araclari Gor
            </button>
          )}
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {car ? "Stokta" : "Demo"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ======================================================================== */
/*  StatCard - Istatistik karti                                              */
/* ======================================================================== */
function StatCard({
  icon,
  value,
  label,
  suffix,
}: {
  icon: string;
  value: string;
  label: string;
  suffix?: string;
}) {
  return (
    <div className="group rounded-xl border border-gray-200/80 bg-white px-4 py-5 shadow-sm transition-all hover:border-green-200 hover:shadow-md hover:shadow-green-100/50 sm:px-5 sm:py-6">
      <div className="mb-2 text-2xl sm:text-3xl">{icon}</div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-xl font-black tracking-tight text-[#111827] sm:text-2xl">{value}</span>
        {suffix && <span className="text-sm font-medium text-gray-500">{suffix}</span>}
      </div>
      <p className="mt-0.5 text-xs font-medium text-gray-500 sm:text-sm">{label}</p>
    </div>
  );
}
