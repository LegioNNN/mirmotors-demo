"use client";

import type { Car, CarSegment } from "@/types";
import { createKaporaLink } from "@/utils/whatsappBalancer";
import { getCarImage } from "@/utils/carImages";

/* -------------------------------------------------------------------------- */
/*  Segment Dürüstlük Rozetleri — Borusan Next renk skalası                  */
/* -------------------------------------------------------------------------- */

const segmentConfig: Record<
  CarSegment,
  {
    label: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    dot: string;
    icon: string;
    tag: string;
  }
> = {
  Kelepir: {
    label: "Kelepir",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200",
    dot: "bg-emerald-500",
    icon: "💸",
    tag: "Fırsat",
  },
  "Orta Direk": {
    label: "Orta Direk",
    badgeBg: "bg-sky-50",
    badgeText: "text-sky-700",
    badgeBorder: "border-sky-200",
    dot: "bg-sky-500",
    icon: "⚖️",
    tag: "Dengeli",
  },
  Premium: {
    label: "Premium",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200",
    dot: "bg-amber-500",
    icon: "👑",
    tag: "Lüks",
  },
  "Yayla Kan": {
    label: "Yayla Kan",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    badgeBorder: "border-rose-200",
    dot: "bg-rose-500",
    icon: "🐂",
    tag: "Sert",
  },
};

/* -------------------------------------------------------------------------- */
/*  Satıldı alt metin havuzu                                                  */
/* -------------------------------------------------------------------------- */

const satildiAltMetin: Record<string, string[]> = {
  Kelepir: ["2 Saatte Satıldı!", "Kapanı Kapandı!"],
  "Orta Direk": ["1 Günde Gitti!", "Yeni Sahibine!"],
  Premium: ["İzmir'e Gitti!", "Kapora Düştü!", "Ankara'ya Gitti!"],
  "Yayla Kan": ["Kars'a Gitti!", "Motor Soğumadan Gitti!", "Dağlara Doğru!"],
};

const pickSatildiText = (segment: CarSegment): string => {
  const pool = satildiAltMetin[segment] ?? ["Satıldı!"];
  return pool[Math.floor(Math.random() * pool.length)];
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const formatPrice = (n: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(n);

const formatKm = (n: number) => new Intl.NumberFormat("tr-TR").format(n);

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

interface CarCardProps {
  car: Car;
  onTokOpen?: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function CarCard({ car, onTokOpen }: CarCardProps) {
  const seg = segmentConfig[car.segment];

  const isSold = car.status === "Satıldı";
  const isOptioned = car.status === "Opsiyonlu";
  const carImage = getCarImage(car.id);

  const handleWpKapora = () => {
    const result = createKaporaLink(car.brand, car.model, car.year);
    if (result) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    } else {
      alert("Şu anda tüm personelimiz yoğun. Lütfen kısa süre sonra tekrar deneyin.");
    }
  };

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white transition-all duration-200
        ${
          isSold
            ? "border-gray-200 opacity-60 grayscale-[30%]"
            : "border-gray-100 hover:shadow-xl hover:-translate-y-0.5"
        }`}
    >
      {/* ──────────────────────────────────────────────────────────────── */}
      {/*  GÖRSEL — aspect-[16/9] · object-cover · hafif zoom on hover   */}
      {/* ──────────────────────────────────────────────────────────────── */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-50">
        <img
          src={carImage}
          alt={`${car.brand} ${car.model}`}
          className={`h-full w-full object-cover transition-transform duration-500 ${
            !isSold ? "group-hover:scale-105" : ""
          }`}
          loading="lazy"
        />

        {/* Hafif gradient taban — loş değil, sadece derinlik */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* ── Segment Rozeti (sol üst) — Borusan soft badge ── */}
        <div
          className={`absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-sm ${seg.badgeBg} ${seg.badgeText} ${seg.badgeBorder}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${seg.dot}`} />
          {seg.icon}
          {seg.label}
        </div>

        {/* Yıl (sağ üst) — bone badge */}
        <span className="absolute right-3 top-3 z-10 rounded-lg bg-white/80 px-2.5 py-1 text-xs font-bold text-gray-700 backdrop-blur-sm shadow-sm border border-white/50">
          {car.year}
        </span>

        {/* ── SATILDI — kurumsal damga ── */}
        {isSold && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
            <div className="w-[85%] -translate-y-2 rotate-[-14deg] bg-red-600 py-3 text-center shadow-lg ring-2 ring-red-300 ring-offset-2 ring-offset-white/60">
              <span className="block text-3xl font-black tracking-[0.25em] text-white drop-shadow-sm">
                SATILDI
              </span>
              <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wider text-red-100">
                {pickSatildiText(car.segment)}
              </span>
            </div>
          </div>
        )}

        {/* Opsiyonlu (alt sol) */}
        {isOptioned && (
          <div className="absolute bottom-3 left-3 z-10 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-700 shadow-sm backdrop-blur-sm">
            OPSİYONLU
          </div>
        )}

        {/* Sancak Tok ▶ butonu (alt sağ) */}
        {!isSold && onTokOpen && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTokOpen();
            }}
            className="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-sm text-gray-700 shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-rose-500 hover:text-white active:scale-95"
            aria-label="Sancak Tok'ta izle"
          >
            ▶
          </button>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────── */}
      {/*  KART İÇERİĞİ                                                    */}
      {/* ──────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4">
        {/* Başlık */}
        <h3 className="text-base font-bold text-[#111827] leading-tight truncate">
          {car.brand} {car.model}
        </h3>

        {/* Esnaf notu */}
        {car.esnaf_notu && (
          <p className="mt-1 text-xs leading-relaxed text-gray-500 line-clamp-2 italic border-l-2 border-amber-300 pl-2.5">
            &ldquo;{car.esnaf_notu}&rdquo;
          </p>
        )}

        {/* ── Borusan spec grid (Yıl, KM, ...) ── */}
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <SpecBox label="Yıl" value={String(car.year)} />
          <SpecBox label="KM" value={`${formatKm(car.km)} km`} />
          <SpecBox
            label="Durum"
            value={car.ekspertiz_durumu ?? "Belirtilmemiş"}
          />
        </div>

        {/* Ayraç */}
        <div className="my-3 h-px w-full bg-gray-100" />

        {/* ── Fiyat — düz, mat siyah, kurumsal ── */}
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-black tracking-tight text-[#111827]">
            {formatPrice(car.price)} ₺
          </span>
          {!isSold && (
            <span className="text-[10px] text-gray-400 font-mono">
              #{car.id.slice(0, 6)}
            </span>
          )}
        </div>

        {/* ── KAPORA BUTONU — Kurumsal yeşil + ping ── */}
        {isSold ? (
          <div className="mt-3 text-right text-[11px] font-medium text-red-500/70">
            Bu araç satılmıştır.
          </div>
        ) : (
          <button
            type="button"
            onClick={handleWpKapora}
            className="relative mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-3 py-2.5 text-xs font-bold text-white transition-all hover:bg-green-600 active:bg-green-800"
          >
            {/* Asil ping noktası — canlı yanıp söner */}
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-300" />
            </span>
            <span>Wp ile Kaporala</span>
          </button>
        )}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*  SpecBox — küçük gri bilgi hücresi, Borusan stili                        */
/* -------------------------------------------------------------------------- */

function SpecBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="text-xs font-semibold text-gray-800">{value}</p>
    </div>
  );
}
