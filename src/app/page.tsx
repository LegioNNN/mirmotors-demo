"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getCarImage } from "@/utils/carImages";
import Navbar from "@/components/ui/Navbar";
import FilterPanel, { type Filters } from "@/components/ui/FilterPanel";
import CarCard from "@/components/ui/CarCard";
import SancakTokModal from "@/components/ui/SancakTokModal";
import NotificationSubscribeModal from "@/components/NotificationSubscribeModal";
import AracSatFormu from "@/components/ui/AracSatFormu";
import type { Car, CarSegment } from "@/types";
import { brand } from "@/config/brand";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"vitrin" | "sat">("vitrin");
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);

  const handleTabChange = useCallback((tab: "vitrin" | "sat") => {
    setActiveTab(tab);
    if (tab === "sat") {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById("arac-sat-formu")?.scrollIntoView({ behavior: "smooth" });
        });
      });
    }
  }, []);


  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokOpen, setTokOpen] = useState(false);
  const [tokStartIndex, setTokStartIndex] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    brand: "", segment: "", priceMin: "", priceMax: "",
    yearMin: "", yearMax: "", kmMin: "", kmMax: "", status: "",
    fuelType: "", transmission: "",
  });
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "newest">("newest");
  const [visibleCount, setVisibleCount] = useState(12);
  const [filterOpen, setFilterOpen] = useState(false);
  const statRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchCars() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });
      if (err) { setError(err.message); setCars([]); }
      else { setCars((data as Car[]) ?? []); }
      setLoading(false);
    }
    fetchCars();
  }, []);

  useEffect(() => { setVisibleCount(12); }, [filters, sortBy]);

  const filteredCars = useMemo(() => {
    let list = [...cars].filter((c) => c.status !== "Yayından Kaldırıldı");
    if (filters.brand) list = list.filter((c) => c.brand.toLowerCase().includes(filters.brand.toLowerCase()));
    if (filters.segment) list = list.filter((c) => c.segment === filters.segment);
    if (filters.priceMin) list = list.filter((c) => c.price >= Number(filters.priceMin));
    if (filters.priceMax) list = list.filter((c) => c.price <= Number(filters.priceMax));
    if (filters.yearMin) list = list.filter((c) => c.year >= Number(filters.yearMin));
    if (filters.yearMax) list = list.filter((c) => c.year <= Number(filters.yearMax));
    if (filters.kmMin) list = list.filter((c) => c.km >= Number(filters.kmMin));
    if (filters.kmMax) list = list.filter((c) => c.km <= Number(filters.kmMax));
    if (filters.status) list = list.filter((c) => c.status === filters.status);
    if (filters.fuelType) list = list.filter((c) => c.fuel_type === filters.fuelType);
    if (filters.transmission) list = list.filter((c) => c.transmission === filters.transmission);
    if (sortBy === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price);
    else {
      list.sort((a, b) => {
        const af = a.is_featured ? 1 : 0;
        const bf = b.is_featured ? 1 : 0;
        if (bf !== af) return bf - af;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }
    return list;
  }, [cars, filters, sortBy]);

  const displayedCars = useMemo(() => filteredCars.slice(0, visibleCount), [filteredCars, visibleCount]);
  const tokCars = useMemo(() => cars.filter((c) => c.status !== "Satıldı" && c.status !== "Yayından Kaldırıldı"), [cars]);

  const featuredCar = useMemo(() => {
    const visible = cars.filter((c) => c.status !== "Yayından Kaldırıldı");
    return visible.find((c) => c.is_hero) ?? visible.find((c) => c.is_featured) ?? visible[0] ?? null;
  }, [cars]);

  const stats = useMemo(() => {
    const visible = cars.filter((c) => c.status !== "Yayından Kaldırıldı");
    return {
      total: visible.length,
      active: visible.filter((c) => c.status === "Aktif").length,
      optioned: visible.filter((c) => c.status === "Kaporalandı" || (c.status as string) === "Opsiyonlu").length,
      sold: cars.filter((c) => c.status === "Satıldı").length,
    };
  }, [cars]);

  const openTok = useCallback((index = 0) => {
    setTokStartIndex(index);
    setTokOpen(true);
  }, []);

  const ShimmerCard = () => (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white overflow-hidden">
      <div className="aspect-[16/10] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
        <div className="h-px bg-gray-100" />
        <div className="h-7 w-1/2 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="flex-1 h-9 bg-gray-200 rounded-lg" />
          <div className="h-9 w-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f9fafb]">
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} onNotificationClick={() => setNotificationModalOpen(true)} />

      {activeTab === "vitrin" && (
        <>
          {/* ================================================================ */}
          {/* HERO                                                              */}
          {/* ================================================================ */}
          <section className="bg-[#111827]">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-center">

                {/* Sol: Başlık + CTA */}
                <div className="lg:col-span-7">
                  {/* Güven rozeti */}
                  <div className="mb-5 flex w-fit max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-gray-300">
                    <svg className="h-3.5 w-3.5 shrink-0 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span className="truncate">{brand.district} · Yetki Belge No: {brand.licenseNo}</span>
                  </div>

                  <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-[3.25rem] leading-[1.1]">
                    <span className="hero-shimmer">{brand.shortName}</span>{" "}
                    <span className="hero-shimmer-sub font-bold">{brand.tagline}</span>
                  </h1>

                  <p className="mt-4 text-base text-gray-400 leading-relaxed max-w-lg">
                    {brand.city}&apos;da {brand.description.toLowerCase()} stok. Her bütçeye uygun seçenek, hızlı WhatsApp iletişimi, takas imkânı.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => document.getElementById("arac-listesi")?.scrollIntoView({ behavior: "smooth" })}
                      className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-[#111827] transition-colors hover:bg-gray-100"
                    >
                      Araçları İncele
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange("sat")}
                      className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
                    >
                      Aracını Sat / Takas Et
                    </button>
                  </div>

                </div>

                {/* Sağ: Öne çıkan araç */}
                <div className="lg:col-span-5">
                  <HeroCarCard car={featuredCar} />
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* STAT BANDI                                                        */}
          {/* ================================================================ */}
          {!loading && !error && (
            <section className="border-b border-gray-800 bg-[#0f1623]" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-2 pb-3">
                <p className="text-center text-xs font-black tracking-widest" style={{ color: "#e8c97a", fontFamily: "'Space Grotesk', 'Poppins', sans-serif", letterSpacing: "0.08em" }}>
                  &ldquo;{brand.motto}&rdquo;
                </p>
              </div>
              <div ref={statRowRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-4 divide-x divide-gray-800 py-3">
                  <StatPill value={stats.total} label="Araç" dark />
                  <StatPill value={stats.active} label="Satışta" accent="green" dark />
                  <StatPill value={stats.optioned} label="Kaporalı" accent="amber" dark />
                  <StatPill value={stats.sold} label="Satılan" dark />
                </div>
              </div>
            </section>
          )}


          {/* ================================================================ */}
          {/* ARAÇ LİSTESİ                                                      */}
          {/* ================================================================ */}
          <section id="arac-listesi" className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8">
            {/* Başlık */}
            <div className="mb-4">
              <h2 className="text-2xl font-black tracking-tight text-[#111827]">{brand.shortName} Vitrini</h2>
              {!loading && (
                <p className="mt-1 text-sm text-gray-500">{filteredCars.length} araç listeleniyor</p>
              )}
            </div>

            {/* Kontroller */}
            {!loading && (
              <div className="mb-5 flex items-center gap-2">
                {/* Mobil: Filtrele butonu */}
                <button
                  type="button"
                  onClick={() => setFilterOpen(true)}
                  className="md:hidden flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm active:scale-[0.97] transition-transform"
                >
                  <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
                  </svg>
                  Filtrele
                  {Object.values(filters).some(v => v !== "") && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#111827] text-[10px] font-black text-white">
                      {Object.values(filters).filter(v => v !== "").length}
                    </span>
                  )}
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-gray-400 shadow-sm"
                >
                  <option value="newest">En Yeni</option>
                  <option value="price_asc">Fiyat ↑</option>
                  <option value="price_desc">Fiyat ↓</option>
                </select>

                {/* GaleriTok */}
                <button
                  type="button"
                  onClick={() => openTok(0)}
                  className="ml-auto relative flex items-center gap-2 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-black text-white shadow-md active:scale-[0.97] transition-transform"
                  style={{ background: "linear-gradient(135deg, #010101 0%, #1a1a2e 50%, #010101 100%)" }}
                >
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="absolute h-full w-full opacity-20" style={{ background: "radial-gradient(ellipse at 30% 50%, #ff0050 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, #00f2ea 0%, transparent 60%)" }} />
                  </span>
                  <span className="relative flex items-center gap-2">
                    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                      <span className="absolute text-base font-black translate-x-[1.5px] translate-y-[0.5px]" style={{ color: "#00f2ea" }}>{brand.tok.letter}</span>
                      <span className="absolute text-base font-black -translate-x-[1.5px] -translate-y-[0.5px]" style={{ color: "#ff0050", opacity: 0.8 }}>{brand.tok.letter}</span>
                      <span className="relative text-base font-black text-white">{brand.tok.letter}</span>
                    </span>
                    <span className="tracking-tight">{brand.tok.label}</span>
                    <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
                      {tokCars.length}
                    </span>
                  </span>
                </button>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Araçlar yüklenirken bir hata oluştu: {error}
              </div>
            )}

            <div className="flex flex-col gap-6 md:flex-row">
              {!loading && !error && (
                <FilterPanel
                  filters={filters}
                  onChange={setFilters}
                  onApply={() => {}}
                  carCount={filteredCars.length}
                  mobileOpen={filterOpen}
                  onMobileClose={() => setFilterOpen(false)}
                  onNotificationClick={() => setNotificationModalOpen(true)}
                />
              )}

              <div className="flex-1">
                {loading ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => <ShimmerCard key={i} />)}
                  </div>
                ) : error ? null : filteredCars.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-gray-400">
                    <svg className="mb-3 h-12 w-12 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
                      <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
                      <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
                      <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
                    </svg>
                    <p className="text-sm font-medium text-gray-500">
                      {cars.length === 0 ? "Henüz araç eklenmemiş." : "Filtreye uygun araç bulunamadı."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                    {displayedCars.map((car) => (
                      <CarCard key={car.id} car={car} />
                    ))}
                  </div>
                )}
                {filteredCars.length > visibleCount && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((p) => p + 12)}
                      className="rounded-xl border border-gray-200 bg-white px-8 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
                    >
                      Daha Fazla Göster ({filteredCars.length - visibleCount})
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* ARAÇ ALIRIM CTA BANDI                                            */}
          {/* ================================================================ */}
          <section className="border-t border-gray-200 bg-[#111827]">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">Aracınızı Satın veya Takas Edin</h2>
                  <p className="mt-2 text-sm text-gray-400 max-w-lg">
                    Bilgilerinizi bırakın, ekibimiz kısa sürede WhatsApp&apos;tan dönüş yapsın. Ücretsiz, taahhütsüz.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12" /></svg>
                      Hızlı ön değerlendirme
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12" /></svg>
                      Takas imkânı
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12" /></svg>
                      WhatsApp ile dönüş
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabChange("sat")}
                  className="shrink-0 rounded-lg bg-white px-7 py-3.5 text-sm font-extrabold text-[#111827] transition-colors hover:bg-gray-100"
                >
                  Aracımı Değerlendir →
                </button>
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* HAKKIMIZDA                                                        */}
          {/* ================================================================ */}
          <section id="hakkimizda" className="bg-white border-t border-gray-200">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
              <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Kurumsal</span>
                <h2 className="mt-1 text-2xl font-black text-[#111827]">{brand.name} Hakkında</h2>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
                {/* Sol — Yetkili kartı */}
                <div className="lg:col-span-4 order-1 lg:order-none">
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="relative h-64 w-full bg-gray-100 overflow-hidden">
                      <img
                        src={brand.owner.photo}
                        alt={brand.owner.name}
                        className="h-full w-full object-cover object-top"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-black text-[#111827]">{brand.owner.name}</h3>
                          <p className="text-xs font-semibold text-green-700 mt-0.5">{brand.owner.title}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-extrabold text-amber-800">
                          <svg className="h-3 w-3 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          {brand.owner.since}
                        </span>
                      </div>
                      {/* Kişisel Instagram */}
                      <a href={brand.owner.instagramUrl} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 hover:bg-gray-100 transition-colors">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 text-white">
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{brand.owner.instagramHandle}</p>
                          <p className="text-[10px] text-gray-400">{brand.owner.instagramFollowers} takipçi</p>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Butonlar */}
                  <div className="mt-4 flex flex-col gap-2">
                    <a
                      href={brand.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                    >
                      <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      Galeri Konumuna Git
                    </a>
                    <a
                      href={brand.social.sahibinden}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                    >
                      <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      Sahibinden Sayfamız
                    </a>
                  </div>
                </div>

                {/* Sağ — İşletme bilgisi */}
                <div className="lg:col-span-8 order-2 lg:order-none space-y-5">
                  {/* Sosyal medya */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SocialCard
                      platform="Instagram"
                      handle={brand.social.instagram.handle}
                      sub={brand.social.instagram.sub}
                      href={brand.social.instagram.url}
                      stats={[{ val: brand.social.instagram.posts, lbl: "gönderi" }, { val: brand.social.instagram.followers, lbl: "takipçi" }]}
                      iconBg="bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400"
                      icon={
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                        </svg>
                      }
                    />
                    <SocialCard
                      platform="TikTok"
                      handle={brand.social.tiktok.displayName}
                      sub={brand.social.tiktok.handle}
                      href={brand.social.tiktok.url}
                      stats={[{ val: brand.social.tiktok.followers, lbl: "takipçi" }, { val: brand.social.tiktok.likes, lbl: "beğeni" }]}
                      iconBg="bg-[#121212]"
                      icon={
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                        </svg>
                      }
                    />
                    <SocialCard
                      platform="Facebook"
                      handle={brand.social.facebook.handle}
                      sub={brand.social.facebook.sub}
                      href={brand.social.facebook.url}
                      stats={[{ val: brand.social.facebook.followers, lbl: "takipçi" }]}
                      iconBg="bg-[#1877F2]"
                      icon={
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      }
                    />
                    <SocialCard
                      platform="Kanal"
                      handle={brand.name}
                      sub="WhatsApp Kanalı"
                      href={brand.social.whatsappChannel.url}
                      stats={[{ val: brand.social.whatsappChannel.followers, lbl: "takipçi" }]}
                      iconBg="bg-[#25D366]"
                      icon={
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      }
                    />
                  </div>

                  {/* İşletme bilgileri */}
                  <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 shadow-sm">
                    <InfoRow
                      icon={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />}
                      label="Yetki Belge No"
                      value={brand.licenseNo}
                    />
                    <InfoRow
                      icon={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>}
                      label="Adres"
                      value={brand.address}
                    />
                    <div className="flex items-start gap-3 px-4 py-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 11.9 19.79 19.79 0 0 1 1.06 3.24 2 2 0 0 1 3 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Telefon</p>
                        <div className="mt-0.5 space-y-0.5">
                          {brand.phones.map((p) => (
                            <a key={p.number} href={`tel:+9${p.number}`} className="block text-sm font-semibold text-gray-700 hover:text-[#111827]">{p.display}</a>
                          ))}
                        </div>
                      </div>
                    </div>
                    <InfoRow
                      icon={<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>}
                      label="Çalışma Saatleri"
                      value={brand.workingHours}
                    />
                  </div>

                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === "sat" && <AracSatFormu />}

      {/* ================================================================== */}
      {/* FOOTER                                                               */}
      {/* ================================================================== */}
      <footer className="bg-[#111827] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Marka */}
            <div className="sm:col-span-2">
              <img src={brand.logos.horizontalDark} alt={brand.name} className="h-9 w-auto" />
              <p className="mt-4 text-sm text-gray-500 max-w-xs">
                {brand.district}&apos;de geniş stok, dürüst esnaf notu, hızlı iletişim.
              </p>
              <p className="mt-2 text-xs text-gray-600">Yetki Belge No: {brand.licenseNo}</p>
            </div>

            {/* Hızlı linkler */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Bağlantılar</p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <button onClick={() => handleTabChange("vitrin")} className="text-sm text-gray-500 hover:text-white transition-colors">
                    Araç Vitrini
                  </button>
                </li>
                <li>
                  <button onClick={() => handleTabChange("sat")} className="text-sm text-gray-500 hover:text-white transition-colors">
                    Aracını Sat
                  </button>
                </li>
                <li>
                  <button onClick={() => document.getElementById("hakkimizda")?.scrollIntoView({ behavior: "smooth" })} className="text-sm text-gray-500 hover:text-white transition-colors">
                    Hakkımızda
                  </button>
                </li>
                <li>
                  <a href={brand.social.sahibinden} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-white transition-colors">
                    Sahibinden
                  </a>
                </li>
              </ul>
            </div>

            {/* İletişim */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">İletişim</p>
              <ul className="mt-4 space-y-2.5">
                {brand.phones.map((p) => (
                  <li key={p.number}>
                    <a href={`tel:+9${p.number}`} className="text-sm text-gray-500 hover:text-white transition-colors">{p.display}</a>
                  </li>
                ))}
                <li className="pt-1">
                  <a
                    href={brand.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    {brand.district} / {brand.city}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/5 pt-6">
            {/* Yasal linkler */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-4">
              <button
                type="button"
                onClick={() => document.getElementById("kvkk-modal")?.classList.remove("hidden")}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2"
              >
                KVKK Aydınlatma Metni
              </button>
              <span className="text-gray-700 text-xs">·</span>
              <button
                type="button"
                onClick={() => document.getElementById("gizlilik-modal")?.classList.remove("hidden")}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2"
              >
                Gizlilik Politikası
              </button>
              <span className="text-gray-700 text-xs">·</span>
              <button
                type="button"
                onClick={() => document.getElementById("cerez-modal")?.classList.remove("hidden")}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2"
              >
                Çerez Politikası
              </button>
              <span className="text-gray-700 text-xs">·</span>
              <a
                href={`https://wa.me/${brand.feedbackWhatsapp}?text=Merhaba%2C%20sitemiz%20hakk%C4%B1nda%20bir%20%C3%B6neri%2Fsikayet%20iletmek%20istiyorum.`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2"
              >
                Öneri &amp; Şikayet
              </a>
            </div>
            <p className="text-center text-xs text-gray-600">
              © {new Date().getFullYear()} {brand.name}. Tüm hakları saklıdır.
              &nbsp;·&nbsp; Yetki Belge No: {brand.licenseNo} &nbsp;·&nbsp; {brand.district} / {brand.city}
            </p>
          </div>
        </div>
      </footer>

      {/* ── KVKK Modal ── */}
      <div id="kvkk-modal" className="fixed inset-0 z-[70] hidden items-center justify-center bg-black/60 p-4 flex">
        <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-black text-[#111827]">KVKK Aydınlatma Metni</h2>
            <button type="button" onClick={() => document.getElementById("kvkk-modal")?.classList.add("hidden")}
              className="rounded-full p-1.5 hover:bg-gray-100 transition-colors">
              <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto px-5 py-4 text-xs leading-relaxed text-gray-600 space-y-3">
            <p><strong className="text-gray-800">Veri Sorumlusu:</strong> {brand.name}, {brand.district} / {brand.city} — Yetki Belge No: {brand.licenseNo}</p>
            <p><strong className="text-gray-800">Kişisel Verilerin İşlenme Amacı:</strong> Aracınızın alım/satım sürecinde sizinle iletişime geçilmesi, teklif hazırlanması ve yasal yükümlülüklerin yerine getirilmesi amacıyla ad-soyad, telefon numarası ve araç bilgileriniz işlenmektedir.</p>
            <p><strong className="text-gray-800">Hukuki Dayanak:</strong> 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında açık rızanıza ve sözleşme kurulması amacına dayalı olarak verileriniz işlenmektedir.</p>
            <p><strong className="text-gray-800">Veri Aktarımı:</strong> Kişisel verileriniz üçüncü kişilerle paylaşılmaz. Yasal zorunluluk durumunda ilgili kamu kurumlarıyla paylaşılabilir.</p>
            <p><strong className="text-gray-800">Saklama Süresi:</strong> Verileriniz, ilgili işlem tamamlandıktan sonra yasal süreler (genellikle 10 yıl) dahilinde saklanır, ardından silinir.</p>
            <p><strong className="text-gray-800">Haklarınız:</strong> KVKK Madde 11 kapsamında kişisel verilerinize erişim, düzeltme, silme, işlemenin kısıtlanması ve itiraz haklarına sahipsiniz. Talepleriniz için <a href={`tel:${brand.primaryPhone}`} className="text-emerald-600 underline">{brand.primaryPhoneDisplay}</a> numaralı hattı arayabilirsiniz.</p>
          </div>
          <div className="border-t border-gray-100 px-5 py-3 text-right">
            <button type="button" onClick={() => document.getElementById("kvkk-modal")?.classList.add("hidden")}
              className="rounded-xl bg-[#111827] px-5 py-2 text-xs font-bold text-white hover:bg-gray-800 transition-colors">
              Anladım
            </button>
          </div>
        </div>
      </div>

      {/* ── Gizlilik Modal ── */}
      <div id="gizlilik-modal" className="fixed inset-0 z-[70] hidden items-center justify-center bg-black/60 p-4 flex">
        <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-black text-[#111827]">Gizlilik Politikası</h2>
            <button type="button" onClick={() => document.getElementById("gizlilik-modal")?.classList.add("hidden")}
              className="rounded-full p-1.5 hover:bg-gray-100 transition-colors">
              <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto px-5 py-4 text-xs leading-relaxed text-gray-600 space-y-3">
            <p>{brand.name} olarak ziyaretçilerimizin gizliliğine saygı duyuyor ve kişisel bilgilerini korumayı öncelik olarak belirliyoruz.</p>
            <p><strong className="text-gray-800">Toplanan Bilgiler:</strong> Sitemizde yalnızca araç ilanı sorgulama ve iletişim formları aracılığıyla gönüllü olarak paylaştığınız bilgiler (ad-soyad, telefon, araç detayları) işlenmektedir. Ödeme bilgisi veya kimlik belgesi toplanmamaktadır.</p>
            <p><strong className="text-gray-800">WhatsApp İletişimi:</strong> WhatsApp butonu aracılığıyla başlatılan görüşmeler Meta Platforms şirketinin gizlilik politikasına tabidir. {brand.name} bu görüşme içeriklerini saklamaz.</p>
            <p><strong className="text-gray-800">Üçüncü Taraf Hizmetler:</strong> Sitede Supabase (veritabanı) ve Cloudflare (içerik dağıtımı) hizmetleri kullanılmaktadır. Bu hizmet sağlayıcılar kendi gizlilik politikalarına tabidir.</p>
            <p><strong className="text-gray-800">İletişim:</strong> Gizlilik konusundaki sorularınız için <a href={`tel:${brand.primaryPhone}`} className="text-emerald-600 underline">{brand.primaryPhoneDisplay}</a> numaralı hattı arayabilirsiniz.</p>
          </div>
          <div className="border-t border-gray-100 px-5 py-3 text-right">
            <button type="button" onClick={() => document.getElementById("gizlilik-modal")?.classList.add("hidden")}
              className="rounded-xl bg-[#111827] px-5 py-2 text-xs font-bold text-white hover:bg-gray-800 transition-colors">
              Anladım
            </button>
          </div>
        </div>
      </div>

      {/* ── Çerez Modal ── */}
      <div id="cerez-modal" className="fixed inset-0 z-[70] hidden items-center justify-center bg-black/60 p-4 flex">
        <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-black text-[#111827]">Çerez Politikası</h2>
            <button type="button" onClick={() => document.getElementById("cerez-modal")?.classList.add("hidden")}
              className="rounded-full p-1.5 hover:bg-gray-100 transition-colors">
              <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto px-5 py-4 text-xs leading-relaxed text-gray-600 space-y-3">
            <p>Bu web sitesi, temel işlevsellik için zorunlu çerezler kullanmaktadır. Pazarlama veya analitik amaçlı çerez kullanılmamaktadır.</p>
            <p><strong className="text-gray-800">Zorunlu Çerezler:</strong> Oturum yönetimi ve site güvenliği için kullanılır. Bu çerezler devre dışı bırakılamaz; ancak kişisel veri içermez.</p>
            <p><strong className="text-gray-800">Üçüncü Taraf Çerezleri:</strong> Cloudflare güvenlik hizmeti kapsamında teknik çerezler yerleştirilebilir. Bu çerezler ziyaretçi kimliğini tespit etmez.</p>
            <p><strong className="text-gray-800">Çerezleri Yönetme:</strong> Tarayıcı ayarlarınızdan çerezleri engelleyebilirsiniz; ancak bu durumda sitenin bazı işlevleri çalışmayabilir.</p>
          </div>
          <div className="border-t border-gray-100 px-5 py-3 text-right">
            <button type="button" onClick={() => document.getElementById("cerez-modal")?.classList.add("hidden")}
              className="rounded-xl bg-[#111827] px-5 py-2 text-xs font-bold text-white hover:bg-gray-800 transition-colors">
              Anladım
            </button>
          </div>
        </div>
      </div>

      {/* GaleriTok FAB */}
      {!loading && (
        <div className="fixed bottom-20 right-4 z-40 lg:bottom-8 lg:right-6">
          <button
            type="button"
            onClick={() => openTok(0)}
            aria-label={`${brand.tok.letter}${brand.tok.label}`}
            className="relative flex flex-col items-center gap-1 active:scale-95 transition-transform"
          >
            <span
              className="relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl"
              style={{ background: "linear-gradient(135deg, #010101 0%, #1a1a2e 100%)" }}
            >
              <span className="absolute inset-0 rounded-2xl opacity-40" style={{ background: "radial-gradient(ellipse at 30% 40%, #ff0050 0%, transparent 55%), radial-gradient(ellipse at 70% 60%, #00f2ea 0%, transparent 55%)" }} />
              <span className="relative flex h-7 w-7 items-center justify-center">
                <span className="absolute text-2xl font-black translate-x-[2px] translate-y-[1px]" style={{ color: "#00f2ea" }}>{brand.tok.letter}</span>
                <span className="absolute text-2xl font-black -translate-x-[2px] -translate-y-[1px]" style={{ color: "#ff0050", opacity: 0.8 }}>{brand.tok.letter}</span>
                <span className="relative text-2xl font-black text-white">{brand.tok.letter}</span>
              </span>
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff0050] text-[8px] font-black text-white ring-2 ring-white">
                {tokCars.length > 99 ? "99+" : tokCars.length}
              </span>
            </span>
            <span className="text-[9px] font-black tracking-widest text-gray-500">TOK</span>
          </button>
        </div>
      )}

      <SancakTokModal
        open={tokOpen}
        onClose={() => setTokOpen(false)}
        cars={tokCars}
        initialIndex={tokStartIndex}
      />

      <NotificationSubscribeModal
        open={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
      />
    </main>
  );
}

/* ======================================================================== */
/* HeroCarCard                                                                */
/* ======================================================================== */
function HeroCarCard({ car }: { car: Car | null }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!car) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 text-gray-700">
        <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
          <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
          <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
        </svg>
      </div>
    );
  }

  const image = car.images?.[0]?.trim() || "";
  const fmt = (n: number) => new Intl.NumberFormat("tr-TR").format(n);

  return (
    <Link href={`/ilan/${car.id}`} className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors">
      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
        {image && !imgError ? (
          <>
            <img
              src={image}
              alt={`${car.brand} ${car.model}`}
              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
            {!imgLoaded && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <img src={brand.logos.icon} alt="" className="h-14 w-14 opacity-20" />
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100">
            <img src={brand.logos.icon} alt="" className="h-14 w-14 opacity-20" />
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded bg-[#111827]/85 px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-amber-400 uppercase">
          <svg className="h-2 w-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Öne Çıkan
        </span>
      </div>

      <div className="p-4">
        <h3 className="text-base font-extrabold text-white">
          {car.brand} <span className="font-semibold text-gray-400">{car.model}</span>
        </h3>
        <p className="mt-1 truncate text-xs text-gray-500">
          {car.year} · {fmt(car.km)} km · {car.fuel_type} · {car.transmission}
        </p>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-2xl font-black text-white">{fmt(car.price)}</span>
          <span className="text-sm font-bold text-gray-500">TL</span>
        </div>
        <div className="mt-3 rounded-lg bg-white py-2.5 text-center text-xs font-bold text-[#111827] transition-colors group-hover:bg-gray-100">
          Detayları İncele →
        </div>
      </div>
    </Link>
  );
}

/* ======================================================================== */
/* StatPill                                                                   */
/* ======================================================================== */
function StatPill({ value, label, accent = "gray", dark = false }: {
  value: number;
  label: string;
  accent?: "green" | "amber" | "gray";
  dark?: boolean;
}) {
  const colors = {
    green: dark ? "text-green-400" : "text-green-700",
    amber: dark ? "text-amber-400" : "text-amber-700",
    gray: dark ? "text-white" : "text-[#111827]",
  };
  return (
    <div className="flex min-w-0 flex-col items-center px-2 py-3 text-center">
      <span className={`text-xl font-black leading-none ${colors[accent]}`}>{value}</span>
      <span className={`mt-0.5 truncate text-[10px] font-medium ${dark ? "text-gray-500" : "text-gray-400"}`}>{label}</span>
    </div>
  );
}

/* ======================================================================== */
/* SocialCard                                                                 */
/* ======================================================================== */
function SocialCard({ platform, handle, sub, stats, iconBg, icon, href }: {
  platform: string;
  handle: string;
  sub: string;
  stats: { val: string; lbl: string }[];
  iconBg: string;
  icon: React.ReactNode;
  href?: string;
}) {
  const inner = (
    <>
      <div className="flex items-center gap-2.5">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-gray-800">{handle}</p>
          <p className="text-[9px] text-gray-400">{sub}</p>
        </div>
        <span className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wider text-gray-500 shrink-0">
          {platform}
        </span>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {stats.map((s) => (
          <span key={s.lbl} className="rounded-md border border-gray-100 bg-gray-50 px-2 py-0.5 text-[10px] text-gray-600">
            <strong className="text-gray-800">{s.val}</strong> {s.lbl}
          </span>
        ))}
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer"
        className="block rounded-xl border border-gray-200 bg-white shadow-sm p-3.5 transition-all hover:border-gray-300 hover:shadow-md">
        {inner}
      </a>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-3.5">
      {inner}
    </div>
  );
}

/* ======================================================================== */
/* InfoRow                                                                    */
/* ======================================================================== */
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          {icon}
        </svg>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-gray-700">{value}</p>
      </div>
    </div>
  );
}
