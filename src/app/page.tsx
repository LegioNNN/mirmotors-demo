"use client";

import { useState, useCallback } from "react";
import BorsaTicker from "@/components/ui/BorsaTicker";
import CarCard from "@/components/ui/CarCard";
import SancakTokModal from "@/components/ui/SancakTokModal";
import AracSatFormu from "@/components/ui/AracSatFormu";
import AdminLeadPanel from "@/components/ui/AdminLeadPanel";
import type { Car, LeadBuying, LeadStatus } from "@/types";

/* -------------------------------------------------------------------------- */
/*  Mock data – 8 farklı segmentte araç                                     */
/* -------------------------------------------------------------------------- */

const mockCars: Car[] = [
  {
    id: "SNC-001",
    brand: "Renault",
    model: "Clio 4 Joy 1.2",
    year: 2016,
    km: 142_000,
    price: 495_000,
    images: [],
    segment: "Kelepir",
    status: "Aktif",
    esnaf_notu:
      "Sağ arka çamurluk boyalı, mekanik yüzde yüz. Piyasanın 80 bin altında, kaçmaz.",
    ekspertiz_durumu: "Ekspertizli",
    created_at: "2025-01-10",
  },
  {
    id: "SNC-002",
    brand: "Volkswagen",
    model: "Passat Highline 1.4 TSI",
    year: 2020,
    km: 68_000,
    price: 1_425_000,
    images: [],
    segment: "Orta Direk",
    status: "Aktif",
    esnaf_notu:
      "2 el, boyasız diye alındı ama kaputta minik bir taş izi var. Onun dışında tertemiz.",
    ekspertiz_durumu: "Ekspertizli",
    created_at: "2025-01-12",
  },
  {
    id: "SNC-003",
    brand: "BMW",
    model: "3.20i M Sport G20",
    year: 2022,
    km: 22_000,
    price: 2_850_000,
    images: [],
    segment: "Premium",
    status: "Aktif",
    esnaf_notu:
      "Sıfır ayarında, hatasız, full donanım. Boya kalınlıkları fabrika çıkışı. Ciddi alıcı gelsin.",
    ekspertiz_durumu: "Ekspertizli",
    created_at: "2025-01-15",
  },
  {
    id: "SNC-004",
    brand: "Fiat",
    model: "Doblo 1.3 Multijet",
    year: 2012,
    km: 340_000,
    price: 275_000,
    images: [],
    segment: "Yayla Kan",
    status: "Aktif",
    esnaf_notu:
      "5 değişen var, motor açılmadı, turbo yeni. Yaylaya çık, dön. Arabadan anlayana duyurulur.",
    ekspertiz_durumu: "Ekspertizli",
    created_at: "2025-01-08",
  },
  {
    id: "SNC-005",
    brand: "Mercedes-Benz",
    model: "E 200 AMG",
    year: 2023,
    km: 9_500,
    price: 4_650_000,
    images: [],
    segment: "Premium",
    status: "Satıldı",
    esnaf_notu:
      "İlk sahibinden, garantili, dokunulmamış. Kapora düştü, hayırlı olsun.",
    ekspertiz_durumu: "Ekspertizli",
    created_at: "2025-01-05",
  },
  {
    id: "SNC-006",
    brand: "Honda",
    model: "Civic Eco 1.6",
    year: 2019,
    km: 91_000,
    price: 925_000,
    images: [],
    segment: "Kelepir",
    status: "Opsiyonlu",
    esnaf_notu:
      "Sol kapı değişmiş, orijinal parça. 1 saat içinde kapora geldi, son anda kaçırma.",
    ekspertiz_durumu: "Ekspertizli",
    created_at: "2025-01-14",
  },
  {
    id: "SNC-007",
    brand: "Ford",
    model: "Focus Titanium 1.5 TDCI",
    year: 2018,
    km: 124_000,
    price: 790_000,
    images: [],
    segment: "Orta Direk",
    status: "Aktif",
    esnaf_notu:
      "Boyalı değişeni yok, sadece bir far değişmiş. Temiz, binilir, satılık.",
    ekspertiz_durumu: "Ekspertizli",
    created_at: "2025-01-16",
  },
  {
    id: "SNC-008",
    brand: "Toyota",
    model: "Corolla 1.8 Hybrid",
    year: 2020,
    km: 56_000,
    price: 1_150_000,
    images: [],
    segment: "Yayla Kan",
    status: "Aktif",
    esnaf_notu:
      "Kazasız boyasız, hibrit avantajıyla az yakıyor. Yazlıkçıların gözdesi, kaçırmayın.",
    ekspertiz_durumu: "Ekspertizli",
    created_at: "2025-01-17",
  },
];

/* -------------------------------------------------------------------------- */
/*  Mock Lead'ler                                                             */
/* -------------------------------------------------------------------------- */

const initialLeads: LeadBuying[] = [
  {
    id: "LEAD-A01-001",
    customer_name: "Mustafa Yıldırım",
    phone: "905321234571",
    brand: "Ford",
    model: "Focus 1.6 TDCI",
    year: 2017,
    expected_price: 720_000,
    status: "Bekliyor",
  },
  {
    id: "LEAD-A01-002",
    customer_name: "Ayşe Kaya",
    phone: "905331234572",
    brand: "Volkswagen",
    model: "Golf 1.4 TSI Highline",
    year: 2019,
    expected_price: 1_150_000,
    status: "Bekliyor",
  },
  {
    id: "LEAD-A01-003",
    customer_name: "Hakan Demirel",
    phone: "905341234573",
    brand: "Renault",
    model: "Megane Sedan 1.5 dCi",
    year: 2020,
    expected_price: 875_000,
    status: "Bekliyor",
  },
];

/* ========================================================================== */
/*  Page                                                                       */
/* ========================================================================== */

export default function Home() {
  const [tokOpen, setTokOpen] = useState(false);
  const [tokStartIndex, setTokStartIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"vitrin" | "sat">("vitrin");
  const [leads, setLeads] = useState<LeadBuying[]>(initialLeads);

  const soldCars = mockCars.filter((c) => c.status === "Satıldı");
  const optionedCars = mockCars.filter((c) => c.status === "Opsiyonlu");
  const activeCars = mockCars.filter((c) => c.status === "Aktif");
  const tokCars = mockCars.filter((c) => c.status !== "Satıldı");

  const openTok = useCallback((index: number = 0) => {
    setTokStartIndex(index);
    setTokOpen(true);
  }, []);

  const handleNewLead = useCallback((lead: LeadBuying) => {
    setLeads((prev) => [lead, ...prev]);
  }, []);

  const handleLeadStatusChange = useCallback(
    (id: string, newStatus: LeadStatus) => {
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
      );
    },
    []
  );

  const pendingCount = leads.filter((l) => l.status === "Bekliyor").length;

  return (
    <main className="min-h-screen bg-[#f9fafb] text-[#111827]">
      {/* ─── Borsa Ticker ─── */}
      <BorsaTicker />

      {/* ─── Sekme Navigasyonu ─── */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 rounded-xl bg-white border border-gray-200 p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("vitrin")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
              activeTab === "vitrin"
                ? "bg-[#111827] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Vitrin
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sat")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
              activeTab === "sat"
                ? "bg-[#111827] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Aracını Sat
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* ─── VİTRİN ─── */}
      {activeTab === "vitrin" && (
        <>
          <section className="mx-auto max-w-7xl px-4 pb-6 pt-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
                  Sancaktar Vitrin
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  <span className="font-semibold text-[#111827]">
                    {activeCars.length}
                  </span>{" "}
                  aktif ilan{" "}
                  <span className="mx-1.5 text-gray-300">·</span>
                  <span className="font-semibold text-[#111827]">
                    {optionedCars.length}
                  </span>{" "}
                  opsiyonlu{" "}
                  <span className="mx-1.5 text-gray-300">·</span>
                  <span className="font-semibold text-red-600">
                    {soldCars.length}
                  </span>{" "}
                  satıldı
                </p>
              </div>

              <button
                type="button"
                onClick={() => openTok(0)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-gray-800 active:scale-[0.97]"
              >
                <span>Sancak Tok</span>
                <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-mono tracking-wider">
                  {tokCars.length}
                </span>
              </button>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
            {mockCars.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-24 text-gray-400">
                <p className="text-sm">Vitrin şu an boş, yeni araçlar ekleniyor...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mockCars.map((car, idx) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    onTokOpen={
                      car.status !== "Satıldı" ? () => openTok(idx) : undefined
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* ─── ARACINI SAT ─── */}
      {activeTab === "sat" && (
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <AracSatFormu onSubmit={handleNewLead} />
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs text-gray-400">Yönetim Paneli (Admin)</span>
              </div>
              <AdminLeadPanel
                leads={leads}
                onStatusChange={handleLeadStatusChange}
              />
            </div>
          </div>
        </section>
      )}

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        <p>
          Sancaktar Otomotiv &copy; {new Date().getFullYear()} &mdash; 750 Araçlık Vitrin
        </p>
      </footer>

      {/* ─── Sancak Tok FAB ─── */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => openTok(0)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111827] text-white shadow-lg transition-all hover:scale-110 active:scale-95"
          aria-label="Sancak Tok - Video Akışı"
        >
          <span className="relative flex items-center justify-center text-xl">
            ▶
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-green-400" />
          </span>
        </button>
      </div>

      {/* ─── Sancak Tok Modal ─── */}
      <SancakTokModal
        open={tokOpen}
        onClose={() => setTokOpen(false)}
        cars={tokCars}
        initialIndex={tokStartIndex}
      />
    </main>
  );
}
