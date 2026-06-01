"use client";

import { useState, useCallback, useMemo } from "react";
import Navbar from "@/components/ui/Navbar";
import BorsaTicker from "@/components/ui/BorsaTicker";
import FilterPanel, { type Filters } from "@/components/ui/FilterPanel";
import CarCard from "@/components/ui/CarCard";
import SancakTokModal from "@/components/ui/SancakTokModal";
import AracSatFormu from "@/components/ui/AracSatFormu";
import AdminLeadPanel from "@/components/ui/AdminLeadPanel";
import type { Car, LeadBuying, LeadStatus } from "@/types";

/* ======================================================================== */
/*  MOCK VERİ                                                               */
/* ======================================================================== */

const mockCars: Car[] = [
  {
    id: "SNC-001", brand: "Renault", model: "Clio 4 Joy 1.2", year: 2016, km: 142_000,
    price: 495_000, images: [], segment: "Kelepir", status: "Aktif",
    esnaf_notu: "Sağ arka çamurluk boyalı, mekanik yüzde yüz. Piyasanın 80 bin altında, kaçmaz.",
    ekspertiz_durumu: "Ekspertizli", fuel_type: "Benzin", transmission: "Manuel", created_at: "2025-01-10",
  },
  {
    id: "SNC-002", brand: "Volkswagen", model: "Passat Highline 1.4 TSI", year: 2020, km: 68_000,
    price: 1_425_000, images: [], segment: "Orta Direk", status: "Aktif",
    esnaf_notu: "2 el, boyasız diye alındı ama kaputta minik bir taş izi var.",
    ekspertiz_durumu: "Ekspertizli", fuel_type: "Benzin", transmission: "Otomatik", created_at: "2025-01-12",
  },
  {
    id: "SNC-003", brand: "BMW", model: "3.20i M Sport G20", year: 2022, km: 22_000,
    price: 2_850_000, images: [], segment: "Premium", status: "Aktif",
    esnaf_notu: "Sıfır ayarında, hatasız, full donanım.",
    ekspertiz_durumu: "Ekspertizli", fuel_type: "Benzin", transmission: "Otomatik", created_at: "2025-01-15",
  },
  {
    id: "SNC-004", brand: "Fiat", model: "Doblo 1.3 Multijet", year: 2012, km: 340_000,
    price: 275_000, images: [], segment: "Yayla Kan", status: "Aktif",
    esnaf_notu: "5 değişen var, motor açılmadı, turbo yeni.",
    ekspertiz_durumu: "Ekspertizli", fuel_type: "Dizel", transmission: "Manuel", created_at: "2025-01-08",
  },
  {
    id: "SNC-005", brand: "Mercedes-Benz", model: "E 200 AMG", year: 2023, km: 9_500,
    price: 4_650_000, images: [], segment: "Premium", status: "Satıldı",
    esnaf_notu: "İlk sahibinden, garantili, dokunulmamış.",
    ekspertiz_durumu: "Ekspertizli", fuel_type: "Benzin", transmission: "Otomatik", created_at: "2025-01-05",
  },
  {
    id: "SNC-006", brand: "Honda", model: "Civic Eco 1.6", year: 2019, km: 91_000,
    price: 925_000, images: [], segment: "Kelepir", status: "Opsiyonlu",
    esnaf_notu: "Sol kapı değişmiş, orijinal parça. 1 saat içinde kapora geldi.",
    ekspertiz_durumu: "Ekspertizli", fuel_type: "Dizel", transmission: "Manuel", created_at: "2025-01-14",
  },
  {
    id: "SNC-007", brand: "Ford", model: "Focus Titanium 1.5 TDCI", year: 2018, km: 124_000,
    price: 790_000, images: [], segment: "Orta Direk", status: "Aktif",
    esnaf_notu: "Boyalı değişeni yok, sadece bir far değişmiş.",
    ekspertiz_durumu: "Ekspertizli", fuel_type: "Dizel", transmission: "Manuel", created_at: "2025-01-16",
  },
  {
    id: "SNC-008", brand: "Toyota", model: "Corolla 1.8 Hybrid", year: 2020, km: 56_000,
    price: 1_150_000, images: [], segment: "Yayla Kan", status: "Aktif",
    esnaf_notu: "Kazasız boyasız, hibrit avantajıyla az yakıyor.",
    ekspertiz_durumu: "Ekspertizli", fuel_type: "Hibrit", transmission: "Otomatik", created_at: "2025-01-17",
  },
];

const initialLeads: LeadBuying[] = [
  { id: "LEAD-A01-001", customer_name: "Mustafa Yıldırım", phone: "905321234571", brand: "Ford", model: "Focus 1.6 TDCI", year: 2017, expected_price: 720_000, status: "Bekliyor" },
  { id: "LEAD-A01-002", customer_name: "Ayşe Kaya", phone: "905331234572", brand: "Volkswagen", model: "Golf 1.4 TSI Highline", year: 2019, expected_price: 1_150_000, status: "Bekliyor" },
  { id: "LEAD-A01-003", customer_name: "Hakan Demirel", phone: "905341234573", brand: "Renault", model: "Megane Sedan 1.5 dCi", year: 2020, expected_price: 875_000, status: "Bekliyor" },
];

/* ======================================================================== */
/*  PAGE                                                                     */
/* ======================================================================== */

export default function Home() {
  const [activeTab, setActiveTab] = useState<"vitrin" | "sat">("vitrin");
  const [tokOpen, setTokOpen] = useState(false);
  const [tokStartIndex, setTokStartIndex] = useState(0);
  const [leads, setLeads] = useState<LeadBuying[]>(initialLeads);
  const [comparedIds, setComparedIds] = useState<string[]>([]);

  // Filtre state
  const [filters, setFilters] = useState<Filters>({
    brand: "", segment: "", priceMin: "", priceMax: "",
    yearMin: "", yearMax: "", kmMin: "", kmMax: "", status: "",
  });
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "newest">("newest");

  // Filtreleme
  const filteredCars = useMemo(() => {
    let list = [...mockCars];
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
  }, [filters, sortBy]);

  const tokCars = useMemo(() => mockCars.filter((c) => c.status !== "Satıldı"), []);

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
    setComparedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  }, []);

  const handleFilterApply = useCallback(() => {
    // filters state zaten güncel — sadece trigger için
  }, []);

  const pendingCount = leads.filter((l) => l.status === "Bekliyor").length;

  return (
    <main className="min-h-screen bg-[#f9fafb]">
      {/* Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Borsa Ticker */}
      <BorsaTicker />

      {/* ─── VİTRİN SEKMESİ ─── */}
      {activeTab === "vitrin" && (
        <section className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          {/* Hero Başlık */}
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
                Araç Listesi
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                <span className="font-semibold text-[#111827]">{filteredCars.length}</span> araç bulundu
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
              <button
                type="button"
                onClick={() => openTok(0)}
                className="rounded-lg bg-[#111827] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-800"
              >
                Sancak Tok ({tokCars.length})
              </button>
            </div>
          </div>

          {/* Filtre + Grid */}
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Sol – Filtre Paneli */}
            <div className="w-full shrink-0 md:w-64">
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                onApply={handleFilterApply}
                carCount={filteredCars.length}
              />
            </div>

            {/* Sağ – Araç Grid */}
            <div className="flex-1">
              {filteredCars.length === 0 ? (
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

      {/* ─── ARACINI SAT SEKMESİ ─── */}
      {activeTab === "sat" && (
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <AracSatFormu onAddLead={handleNewLead} />
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs text-gray-400">Yönetim Paneli (Admin)</span>
                {pendingCount > 0 && (
                  <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {pendingCount}
                  </span>
                )}
              </div>
              <AdminLeadPanel leads={leads} onStatusChange={handleLeadStatusChange} />
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        <p>Sancaktar Otomotiv &copy; {new Date().getFullYear()} &mdash; 750 Araçlık Vitrin</p>
      </footer>

      {/* Sancak Tok FAB */}
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

      {/* Sancak Tok Modal */}
      <SancakTokModal
        open={tokOpen}
        onClose={() => setTokOpen(false)}
        cars={tokCars}
        initialIndex={tokStartIndex}
      />
    </main>
  );
}
