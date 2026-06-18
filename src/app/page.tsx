
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
import type { Car, CarSegment } from "@/types";

/* ======================================================================== */
/*  PAGE                                                                     */
/* ======================================================================== */

export default function Home() {
  const [activeTab, setActiveTab] = useState<"vitrin" | "sat">("vitrin");

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

  // Vitrin state
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tok state
  const [tokOpen, setTokOpen] = useState(false);
  const [tokStartIndex, setTokStartIndex] = useState(0);

  // Anıl fotoğraf hatası state
  const [anilImgError, setAnilImgError] = useState(false);

  // Karsilastirma
  const [comparedIds, setComparedIds] = useState<string[]>([]);

  // Filtre state
  const [filters, setFilters] = useState<Filters>({
    brand: "", segment: "", priceMin: "", priceMax: "",
    yearMin: "", yearMax: "", kmMin: "", kmMax: "", status: "",
  });
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "newest">("newest");
  const [visibleCount, setVisibleCount] = useState(12);

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

  /* Filtre/sıralama değişince visibleCount'u sıfırla */
  useEffect(() => {
    setVisibleCount(12);
  }, [filters, sortBy]);

  /* --- Filtreleme --- */
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

    if (sortBy === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price);
    else {
      list.sort((a, b) => {
        const aFeatured = a.is_featured ? 1 : 0;
        const bFeatured = b.is_featured ? 1 : 0;
        if (bFeatured !== aFeatured) return bFeatured - aFeatured;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return list;
  }, [cars, filters, sortBy]);

  /* Görünür araç sayısı – "Daha Fazla Göster" sistemi için */
  const displayedCars = useMemo(() => filteredCars.slice(0, visibleCount), [filteredCars, visibleCount]);

  const tokCars = useMemo(() => cars.filter((c) => c.status !== "Satıldı" && c.status !== "Yayından Kaldırıldı"), [cars]);

  /* --- Hero aracı (öne çıkan) - önce is_hero, sonra is_featured, sonra ilk aktif --- */
  const featuredCar = useMemo(() => {
    const visibleCars = cars.filter((c) => c.status !== "Yayından Kaldırıldı");
    const heroCar = visibleCars.find((c) => c.is_hero === true);
    if (heroCar) return heroCar;
    const featuredCar = visibleCars.find((c) => c.is_featured === true);
    if (featuredCar) return featuredCar;
    return visibleCars[0] ?? null;
  }, [cars]);

  /* --- Vitrin istatistikleri (canli) --- */
  const stats = useMemo(() => {
    const visible = cars.filter((c) => c.status !== "Yayından Kaldırıldı");
    return {
      total: visible.length,
      featured: visible.filter((c) => c.is_featured).length,
      optioned: visible.filter((c) => c.status === "Kaporalandı" || (c.status as string) === "Opsiyonlu").length,
      sold: cars.filter((c) => c.status === "Satıldı").length,
      hasFeatured: visible.some((c) => c.is_featured),
    };
  }, [cars]);

  /* --- Callback'ler --- */
  const openTok = useCallback((index: number = 0) => {
    setTokStartIndex(index);
    setTokOpen(true);
  }, []);

  const handleCompare = useCallback((id: string, checked: boolean) => {
    setComparedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  }, []);

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
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

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
                      Araçları İncele
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange("sat")}
                      className="rounded-lg border border-gray-600 bg-white/5 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-gray-500 hover:bg-white/10 active:scale-[0.97]"
                    >
                      Aracını Sat / Takas Et
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
                  {(() => {
                    const heroImage = featuredCar?.images?.[0]?.trim() || "";
                    console.log("[Hero Debug]", {
                      heroCarId: featuredCar?.id,
                      brand: featuredCar?.brand,
                      model: featuredCar?.model,
                      isHero: featuredCar?.is_hero,
                      images: featuredCar?.images,
                      heroImage,
                    });
                    return <FeaturedCarCard car={featuredCar} imageUrl={heroImage} />;
                  })()}
                </div>
              </div>
            </div>
          </section>

          {/* ======================================================================== */}
          {/*  CANLI ISTATISTIK CHIP'LERI (PremiumStatChip)                            */}
          {/* ======================================================================== */}
          <section className="relative -mt-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {!loading && !error ? (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <PremiumStatChip
                    icon={
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
                        <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
                        <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
                      </svg>
                    }
                    value={stats.total}
                    label="Görünür Araç"
                    color="gray"
                  />
                  <PremiumStatChip
                    icon={
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    }
                    value={stats.featured}
                    label="Öne Çıkan"
                    color="amber"
                  />
                  <PremiumStatChip
                    icon={
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                    }
                    value={stats.optioned}
                    label="Kaporalandı"
                    color="amber"
                  />
                  <PremiumStatChip
                    icon={
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    }
                    value={stats.sold}
                    label="Satıldı"
                    color="red"
                  />
                  <span className="ml-auto hidden text-[10px] font-medium text-gray-400 sm:inline-flex items-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                    </span>
                    Panelden yönetilen canlı stok
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                  <StatCard icon="🚘" value="750+" label="Guncel Stok" />
                  <StatCard icon="⚡" value="24" label="Saat Hizli Donus" suffix=" Saat" />
                  <StatCard icon="👥" value="5+" label="Satis Danismani" />
                  <StatCard icon="📍" value="Istanbul" label="Galeri Lokasyonu" />
                </div>
              )}
            </div>
          </section>

          {/* ======================================================================== */}
          {/*  ARAC LISTESI                                                             */}
          {/* ======================================================================== */}
          <section id="arac-listesi" className="mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 lg:px-8">
            {/* ------------------------------------------------------------------ */}
            {/*  VITRIN BASLIK – Sancaktar Vitrini                                 */}
            {/* ------------------------------------------------------------------ */}
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-black tracking-tight text-[#111827] sm:text-3xl">
                    Sancaktar Vitrini
                  </h2>
                  {/* "Panelden yönetilen canlı stok" – mobilde chip */}
                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-gray-400 sm:hidden">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                    </span>
                    Canlı Stok
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Öne çıkan, aktif ve güncel araçlarımızı inceleyin.
                </p>
                {/* Öne Çıkanlar etiketi – sadece is_featured true varsa */}
                {!loading && stats.hasFeatured && (
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Öne Çıkanlar
                  </span>
                )}
                {!loading && (
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    Vitrinde {filteredCars.length} araç gösteriliyor
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
                    className="group relative inline-flex items-center gap-3 rounded-xl bg-gradient-to-br from-[#111827] via-[#1a2332] to-[#0f172a] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-gray-900/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-800/40 active:translate-y-0 active:shadow-md border border-gray-700/30"
                  >
                    {/* Özel araba+video ikonu */}
                    <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#1e293b] to-[#0f172a] ring-1 ring-white/20">
                      <svg className="h-4 w-4 text-white drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
                        <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
                        <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
                      </svg>
                      {/* Küçük oynatma noktası */}
                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-1 ring-white/30" />
                    </span>

                    {/* Metin */}
                    <span className="flex flex-col items-start leading-tight">
                      <span className="text-sm font-extrabold tracking-tight">SancakTok</span>
                      <span className="text-[10px] font-semibold text-gray-400 group-hover:text-gray-300 transition-colors">({tokCars.length})</span>
                    </span>

                    {/* Sağ ok / play ikonu */}
                    <svg className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
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
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-gray-400">
                    <svg className="mb-3 h-14 w-14 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
                      <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
                      <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
                      <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
                    </svg>
                    <p className="text-sm font-medium text-gray-600">
                      {!loading && cars.length === 0
                        ? "Şu anda vitrine eklenmiş araç bulunmuyor."
                        : "Filtrelere uygun araç bulunamadı."}
                    </p>
                    {!loading && cars.length === 0 && (
                      <p className="mt-1.5 text-xs text-gray-400">
                        Admin panelden araç ekleyerek vitrini doldurabilirsiniz.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {displayedCars.map((car) => (
                      <CarCard
                        key={car.id}
                        car={car}
                        onCompare={handleCompare}
                        isCompared={comparedIds.includes(car.id)}
                      />
                    ))}
                  </div>
                )}
                {filteredCars.length > visibleCount && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 12)}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-md active:scale-[0.97]"
                    >
                      Daha Fazla Göster
                      <span className="text-[11px] font-medium text-gray-400">
                        ({filteredCars.length - visibleCount})
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
        </section>

          {/* ======================================================================== */}
          {/*  Aracini Sat / Takas Et – Premium CTA Bandi                              */}
          {/* ======================================================================== */}
          <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111827] via-[#1a2332] to-[#0f172a] shadow-xl">
              {/* Arka plan deseni */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

              {/* Gradient vurgu - sol ust */}
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-green-800/10 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-green-700/5 blur-3xl" />

              <div className="relative flex flex-col items-start gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:px-14">
                {/* Sol - Metin */}
                <div className="max-w-xl">
                  {/* Rozet */}
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3.5 py-1 text-[11px] font-semibold text-green-400 backdrop-blur-sm">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                    </span>
                    Alım Garantili
                  </div>

                  <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                    Aracınızı Sancaktar&rsquo;a Satın veya Takasa Verin
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-gray-400 sm:text-base">
                    Araç bilgilerinizi bırakın, alım ekibimiz kısa sürede sizinle iletişime geçsin.
                  </p>

                  {/* Fayda maddeleri */}
                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300">
                      <svg className="h-3.5 w-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Hızlı ön değerlendirme
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300">
                      <svg className="h-3.5 w-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Takas imkânı
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300">
                      <svg className="h-3.5 w-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      WhatsApp ile dönüş
                    </span>
                  </div>
                </div>

                {/* Sag - Buton */}
                <div className="shrink-0 self-start lg:self-center">
                  <button
                    type="button"
                    onClick={() => handleTabChange("sat")}
                    className="group relative inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-green-700 to-green-600 px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-green-900/30 transition-all hover:from-green-600 hover:to-green-500 hover:shadow-xl hover:shadow-green-800/40 active:scale-[0.97]"
                  >
                    <svg className="h-5 w-5 transition-transform group-hover:rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Aracımı Değerlendir
                  </button>
                  <p className="mt-2 text-[10px] font-medium text-gray-500 text-right lg:text-center">
                    Ücretsiz &amp; Taahhütsüz
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ======================================================================== */}
      {/*  HAKKIMIZDA                                                               */}
      {/* ======================================================================== */}
      <section
        id="hakkimizda"
        className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white"
      >
        {/* ince üst ayırıcı */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          {/* Üst rozet + başlık */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full border border-gray-200 bg-white px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500 shadow-sm">
              Kurumsal
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-[#111827] sm:text-3xl">
              Sancaktar Otomotiv Hakkında
            </h2>
          </div>

          {/* Sol: Sosyal + İşletme / Sağ: Anıl Kartı */}
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            {/* --- SOL KOLON: Sosyal Kanıt + İşletme Bilgisi --- */}
            <div className="lg:col-span-7 order-2 lg:order-none space-y-5">
              {/* Sosyal medya kartları - yan yana */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Instagram Kartı */}
                {/* Instagram Kartı – daha kompakt */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-3.5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 text-white shadow-sm">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-gray-800 truncate">@sancaktar_otomtiv</span>
                          <span className="rounded-full bg-pink-50 border border-pink-200 px-1.5 py-0.5 text-[7px] font-semibold text-pink-600 uppercase tracking-wider">Instagram</span>
                        </div>
                        <p className="text-[9px] text-gray-400 mt-0.5">Motorlu Araç Şirketi</p>
                      </div>
                    </div>
                    {/* İstatistik badges */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-gray-50 border border-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        <span className="font-bold text-gray-800">363</span> gönderi
                      </span>
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-gray-50 border border-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        <span className="font-bold text-gray-800">876 B</span> takipçi
                      </span>
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-gray-50 border border-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        <span className="font-bold text-gray-800">779</span> takip
                      </span>
                    </div>
                  </div>
                </div>

                {/* TikTok Kartı – sadece istatistik, alt bilgi yok */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-3.5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#121212] text-white shadow-sm">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-gray-800 truncate">Sancaktar Otomotiv</span>
                          <span className="rounded-full bg-[#121212] border border-gray-300 px-1.5 py-0.5 text-[7px] font-semibold text-white uppercase tracking-wider">TikTok</span>
                        </div>
                        <p className="text-[9px] text-gray-400 mt-0.5">@sancaktar.otomoti</p>
                      </div>
                    </div>
                    {/* İstatistik badges */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-gray-50 border border-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        <span className="font-bold text-gray-800">134.6K</span> takipçi
                      </span>
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-gray-50 border border-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        <span className="font-bold text-gray-800">431.2K</span> beğeni
                      </span>
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-gray-50 border border-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        <span className="font-bold text-gray-800">3</span> takip
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* İşletme Bilgi Kartı */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
                {/* Yetki Belge */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Yetki Belge No</p>
                    <p className="text-sm font-bold text-gray-800">3407136</p>
                  </div>
                </div>
                {/* Adres */}
                <div className="flex items-start gap-3 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Adres</p>
                    <p className="text-sm font-medium text-gray-700">
                      Türkoba Mahallesi Bağlar 1. Cd. No:59<br />Büyükçekmece / İstanbul
                    </p>
                  </div>
                </div>
                {/* Telefonlar */}
                <div className="flex items-start gap-3 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Telefon</p>
                    <div className="mt-0.5 space-y-0.5">
                      <a href="tel:+905019443734" className="block text-sm font-medium text-gray-700 transition-colors hover:text-emerald-700">0501 944 37 34</a>
                      <a href="tel:+905015956737" className="block text-sm font-medium text-gray-700 transition-colors hover:text-emerald-700">0501 595 67 37</a>
                      <a href="tel:+905310320250" className="block text-sm font-medium text-gray-700 transition-colors hover:text-emerald-700">0531 032 02 50</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dış bağlantı butonları */}
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://maps.app.goo.gl/J7dBNHPZ7ptMgqm6A?g_st=aw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-6 py-3.5 text-sm font-bold text-emerald-800 shadow-sm transition-all hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-200/50 active:scale-[0.97]"
                >
                  <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Konuma Git
                  <svg className="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </a>
                <a
                  href="https://sancaktaroto.sahibinden.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-xl border-2 border-amber-200 bg-amber-50 px-6 py-3.5 text-sm font-bold text-amber-800 shadow-sm transition-all hover:bg-amber-100 hover:border-amber-300 hover:shadow-md hover:shadow-amber-200/50 active:scale-[0.97]"
                >
                  <svg className="h-5 w-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Sahibinden Sayfamız
                  <svg className="h-3.5 w-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </a>
                <a
                  href="https://whatsapp.com/channel/0029Vb7jgOWICVf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-xl border-2 border-green-300 bg-green-50 px-6 py-3.5 text-sm font-bold text-green-800 shadow-sm transition-all hover:bg-green-100 hover:border-green-400 hover:shadow-md hover:shadow-green-200/50 active:scale-[0.97]"
                >
                  <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp Kanalı
                  <svg className="h-3.5 w-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </a>
              </div>
            </div>

            {/* --- SAĞ KOLON: Anıl Sancaktar - Sade Kişisel Kartı --- */}
            <div className="lg:col-span-5 order-1 lg:order-none">
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* Dekoratif üst çizgi */}
                <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400" />

                {/* Fotoğraf alanı – kompakt yükseklik */}
                <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 sm:h-56 lg:h-60">
                  {!anilImgError && (
                    <img
                      src="/anil-sancaktar.png"
                      alt=""
                      className="h-full w-full object-cover"
                      onError={() => setAnilImgError(true)}
                    />
                  )}
                  <div
                    className={`absolute inset-0 flex-col items-center justify-center text-gray-400 ${
                      anilImgError ? "flex" : "hidden"
                    }`}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 border-2 border-gray-300">
                      <svg className="h-7 w-7 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="mt-1 text-[10px] font-bold text-gray-500">Anıl Sancaktar</span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* İçerik – sıkı padding */}
                <div className="p-4">
                  {/* İsim + 1991 Badge (yan yana) + Ünvan */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-black tracking-tight text-[#111827]">Anıl Sancaktar</h3>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-300 px-3 py-1 text-xs font-extrabold tracking-wide text-amber-900 shadow-sm shadow-amber-200/50 shrink-0">
                      <svg className="h-3.5 w-3.5 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      1991
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-emerald-700">Sancaktar Otomotiv Yetkilisi</p>

                  {/* Instagram - Kişisel Hesap */}
                  <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/80">
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 text-white shadow-sm">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-gray-800">@anilsancaktar</span>
                          <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[7px] font-semibold text-gray-500 uppercase tracking-wider">Kişisel</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-gray-500 mt-0.5">
                          <span><strong className="text-gray-700">120</strong> gönderi</span>
                          <span className="text-gray-300">|</span>
                          <span><strong className="text-gray-700">128 B</strong> takipçi</span>
                          <span className="text-gray-300">|</span>
                          <span><strong className="text-gray-700">97</strong> takip</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- ARACINI SAT --- */}
      {activeTab === "sat" && (
        <>
          <AracSatFormu />
        </>
      )}

      {/* ======================================================================== */}
      {/*  PREMIUM KURUMSAL FOOTER                                                */}
      {/* ======================================================================== */}
      <footer className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#111827] to-[#1a2332] border-t border-white/5">
        {/* Dekoratif arka plan */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-800/5 blur-3xl" />
        <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-emerald-700/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
            {/* --- Sol: Marka + Kurumsal + Guven --- */}
            <div className="sm:col-span-2 lg:col-span-5">
              {/* Marka logotipi */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-600 shadow-lg shadow-emerald-900/30">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
                    <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
                    <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-base font-black tracking-tight text-white">SANCAKTAR</span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">Otomotiv</span>
                </div>
              </div>

              {/* Kurumsal aciklama */}
              <p className="mt-5 text-sm leading-relaxed text-gray-400 max-w-sm">
                İstanbul Büyükçekmece&rsquo;de geniş araç stoğu, hızlı iletişim
                ve güvenilir alım-satım deneyimi.
              </p>

              {/* Yetki Belge No */}
              <div className="mt-4 flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="text-[11px] font-medium text-gray-400">
                  Yetki Belge No: <span className="text-gray-300">3407136</span>
                </span>
              </div>

              {/* Guven maddeleri */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                    <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-400">Galeri güvencesi &bull; Belge No: 3407136</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                    <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-400">Hızlı WhatsApp iletişimi</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                    <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M17 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6l2 2h6a2 2 0 0 1 2 2v1" />
                      <path d="M17 22v-4" />
                      <path d="M13 22v-6" />
                      <path d="M9 22v-2" />
                      <circle cx="17" cy="14" r="3" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-400">Takas ve araç alım desteği</span>
                </div>
              </div>
            </div>

            {/* --- Orta: Hizli Baglantilar --- */}
            <div className="lg:col-span-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-300">Hızlı Bağlantılar</h3>
              <ul className="mt-5 space-y-3">
                <li>
                  <button
                    onClick={() => handleTabChange("vitrin")}
                    className="group flex items-center gap-2 text-xs font-medium text-gray-500 transition-colors hover:text-white"
                  >
                    <svg className="h-3 w-3 text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    Araç Vitrini
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange("sat")}
                    className="group flex items-center gap-2 text-xs font-medium text-gray-500 transition-colors hover:text-white"
                  >
                    <svg className="h-3 w-3 text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    Aracını Sat
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("hakkimizda");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="group flex items-center gap-2 text-xs font-medium text-gray-500 transition-colors hover:text-white"
                  >
                    <svg className="h-3 w-3 text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    Hakkımızda
                  </button>
                </li>
                <li>
                  <a
                    href="https://maps.app.goo.gl/J7dBNHPZ7ptMgqm6A?g_st=aw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-xs font-medium text-gray-500 transition-colors hover:text-white"
                  >
                    <svg className="h-3 w-3 text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    Konum
                  </a>
                </li>
                <li>
                  <a
                    href="https://sancaktaroto.sahibinden.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-xs font-medium text-gray-500 transition-colors hover:text-white"
                  >
                    <svg className="h-3 w-3 text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    Sahibinden
                  </a>
                </li>
              </ul>
            </div>

            {/* --- Sag: Iletisim Kutucugu --- */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-6 backdrop-blur-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-200">İletişim</h3>
                <div className="mt-5 space-y-4">
                  {/* Telefon 1 */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
                      <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-200">Telefon</p>
                      <div className="mt-0.5 space-y-0.5">
                        <a href="tel:+905019443734" className="block text-sm font-medium text-gray-400 transition-colors hover:text-white">0501 944 37 34</a>
                        <a href="tel:+905015956737" className="block text-sm font-medium text-gray-400 transition-colors hover:text-white">0501 595 67 37</a>
                        <a href="tel:+905310320250" className="block text-sm font-medium text-gray-400 transition-colors hover:text-white">0531 032 02 50</a>
                      </div>
                    </div>
                  </div>

                  {/* Lokasyon */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
                      <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-200">Adres</p>
                      <p className="mt-0.5 text-sm font-medium text-gray-400">
                        Türkoba Mah. Bağlar 1. Cd. No:59<br />Büyükçekmece / İstanbul
                      </p>
                      <a
                        href="https://maps.app.goo.gl/J7dBNHPZ7ptMgqm6A?g_st=aw"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-500 transition-colors hover:text-emerald-400"
                      >
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                        Konum
                      </a>
                    </div>
                  </div>

                  {/* Yetki Belge */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
                      <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-200">Yetki Belge No</p>
                      <p className="mt-0.5 text-sm font-medium text-gray-400">3407136</p>
                    </div>
                  </div>

                  {/* Calisma Saatleri */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
                      <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-200">Çalışma Saatleri</p>
                      <p className="mt-0.5 text-sm font-medium text-gray-400">Her gün 09:00 - 20:00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alt ayrac + telif satiri */}
          <div className="mt-12 border-t border-white/5 pt-6 text-center">
            <p className="text-[11px] font-medium tracking-wide text-gray-600">
              &copy; 2026 Sancaktar Otomotiv. Tüm hakları saklıdır.
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
/*  FeaturedCarCard - One cikan arac karti (hero) - Premium                  */
/* ======================================================================== */
function FeaturedCarCard({ car, imageUrl }: { car: Car | null; imageUrl: string }) {
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

  // Hero'da asla dış fallback görsel kullanma - sadece imageUrl
  const hasImage = !!(imageUrl && !imgError);

  const formatPriceInline = (n: number) =>
    new Intl.NumberFormat("tr-TR", { style: "decimal", minimumFractionDigits: 0 }).format(n);
  const formatKmInline = (n: number) => new Intl.NumberFormat("tr-TR").format(n);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-2xl shadow-black/30 backdrop-blur-sm transition-all duration-500 hover:border-white/20 hover:shadow-green-900/20 hover:-translate-y-0.5">
      {/* Kart ustu - "Öne Çıkan" etiketi - minik ve şık */}
      <div className="absolute left-3 top-3 z-20 inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-400 backdrop-blur-sm border border-amber-500/20 shadow-sm">
        <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        Öne Çıkan
      </div>

      {/* Gorsel alani */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
        {hasImage ? (
          <>
            <img
              src={imageUrl}
              alt={`${displayCar.brand} ${displayCar.model}`}
              className={`h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-110 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gray-800" />
            )}
            {/* Hafif alt gradient - sadece badge okunurluğu için */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
          </>
        ) : (
          <>
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <svg className="h-14 w-14 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                  <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
                  <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
                  <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
                </svg>
                <span className="text-[10px] font-medium uppercase tracking-widest text-gray-600">
                  Görsel hazırlanıyor
                </span>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
          </>
        )}
      </div>

      {/* Kart icerigi */}
      <div className="p-5">
        <h3 className="text-lg font-black tracking-tight text-white">
          {displayCar.brand} {displayCar.model}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
          <span className="font-medium">{displayCar.year}</span>
          <span className="text-gray-600">&bull;</span>
          <span className="font-medium">{formatKmInline(displayCar.km)} KM</span>
          <span className="text-gray-600">&bull;</span>
          <span className="font-medium">{displayCar.fuel_type}</span>
          <span className="text-gray-600">&bull;</span>
          <span className="font-medium">{displayCar.transmission}</span>
        </div>

        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-2xl font-black tracking-tight text-white">
            {formatPriceInline(displayCar.price)}
          </span>
          <span className="text-sm font-bold text-gray-500">TL</span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {displayCar.id !== "default" ? (
            <Link
              href={`/ilan/${displayCar.id}`}
              className="flex-1 rounded-lg bg-gradient-to-r from-green-700 to-green-600 px-4 py-3 text-center text-xs font-bold text-white shadow-lg shadow-green-900/30 transition-all hover:shadow-xl hover:shadow-green-800/40 hover:from-green-600 hover:to-green-500 active:scale-[0.97] block"
            >
              Detayları İncele
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                document.getElementById("arac-listesi")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex-1 rounded-lg bg-gradient-to-r from-green-700 to-green-600 px-4 py-3 text-center text-xs font-bold text-white shadow-lg shadow-green-900/30 transition-all hover:shadow-xl hover:shadow-green-800/40 hover:from-green-600 hover:to-green-500 active:scale-[0.97]"
            >
              Tüm Araçları Gör
            </button>
          )}
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-semibold tracking-wider text-gray-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
            </span>
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

/* ======================================================================== */
/*  PremiumStatChip – vitrin ustu canli istatistik mini bilgi karti          */
/* ======================================================================== */
function PremiumStatChip({
  icon,
  value,
  label,
  color = "gray",
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color?: "gray" | "amber" | "red";
}) {
  const colorClasses = {
    gray: "bg-white border-gray-200",
    amber: "bg-amber-50/90 border-amber-200",
    red: "bg-red-50/90 border-red-200",
  };
  const textClasses = {
    gray: "text-[#111827]",
    amber: "text-amber-800",
    red: "text-red-800",
  };
  const iconClasses = {
    gray: "text-gray-500",
    amber: "text-amber-600",
    red: "text-red-600",
  };
  const valueClasses = {
    gray: "text-[#111827]",
    amber: "text-amber-900",
    red: "text-red-900",
  };

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-lg border px-3.5 py-2 shadow-sm transition-all hover:shadow-md ${colorClasses[color]}`}
    >
      <div className={`shrink-0 ${iconClasses[color]}`}>{icon}</div>
      <div className="flex flex-col">
        <span className={`text-lg font-black leading-none tracking-tight ${valueClasses[color]}`}>
          {value}
        </span>
        <span className="text-[10px] font-medium text-gray-500 leading-tight mt-0.5">{label}</span>
      </div>
    </div>
  );
}
