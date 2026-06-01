"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Car } from "@/types";
import { createKaporaLink } from "@/utils/whatsappBalancer";

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

interface SancakTokModalProps {
  /** Açık/kapalı */
  open: boolean;
  /** Kapatma callback */
  onClose: () => void;
  /** Akışta gösterilecek araçlar (genelde sadece Aktif olanlar) */
  cars: Car[];
  /** Başlangıç index'i (hangi araçtan başlasın) */
  initialIndex?: number;
}

/* -------------------------------------------------------------------------- */
/*  Yardımcı – fiyat format                                                  */
/* -------------------------------------------------------------------------- */

const formatPrice = (n: number) =>
  new Intl.NumberFormat("tr-TR").format(n);

/* -------------------------------------------------------------------------- */
/*  Bileşen                                                                   */
/* -------------------------------------------------------------------------- */

export default function SancakTokModal({
  open,
  onClose,
  cars,
  initialIndex = 0,
}: SancakTokModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number | null>(null);

  /* ------ Index sınırları kontrolü ------ */
  const safeIndex = Math.max(0, Math.min(currentIndex, cars.length - 1));
  const currentCar: Car | undefined = cars[safeIndex];

  /* ------ Index değişince scroll'u sıfırla (animasyon için) ------ */
  const resetScroll = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  useEffect(() => {
    resetScroll();
  }, [safeIndex, resetScroll]);

  /* ------ Klavye (yön tuşları / Escape) ------ */
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      }
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        setCurrentIndex((prev) => Math.min(cars.length - 1, prev + 1));
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, cars.length]);

  /* ------ Fare tekerleği (wheel) ------ */
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!open) return;
      const delta = e.deltaY > 0 ? 1 : -1;
      setCurrentIndex((prev) =>
        Math.max(0, Math.min(cars.length - 1, prev + delta))
      );
    },
    [open, cars.length]
  );

  /* ------ Mobil touch/drag ------ */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartY.current === null) return;
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      touchStartY.current = null;

      if (Math.abs(diff) < 30) return; // eşik

      if (diff > 0) {
        // yukarı kaydır -> sonraki
        setCurrentIndex((prev) => Math.min(cars.length - 1, prev + 1));
      } else {
        // aşağı kaydır -> önceki
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      }
    },
    [cars.length]
  );

  /* ------ Kapora butonu ------ */
  const handleKapora = useCallback(() => {
    if (!currentCar) return;
    const result = createKaporaLink(
      currentCar.brand,
      currentCar.model,
      currentCar.year
    );
    if (result) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    } else {
      // Hiç personel aktif değilse uyarı
      alert("Şu anda tüm personelimiz yoğun. Lütfen kısa süre sonra tekrar deneyin.");
    }
  }, [currentCar]);

  /* ------ Modal kapalıysa render etme ------ */
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      {/* İç container – mobil genişlik */}
      <div
        ref={containerRef}
        className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-black outline-none"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ----------------------------------------------------------------- */}
        {/*  Video / Görsel Alanı                                            */}
        {/* ----------------------------------------------------------------- */}
        <div className="relative flex-1">
          {currentCar ? (
            <>
              {/* Mock video alanı – gerçekte <video> etiketi + S3/CloudFront */}
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-black">
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="text-7xl opacity-20 select-none">🎬</span>
                  <p className="text-sm font-medium text-gray-500">
                    {currentCar.brand} {currentCar.model}
                  </p>
                  {/* video_url varsa göster, yoksa placeholder */}
                  {currentCar.video_url ? (
                    <video
                      src={currentCar.video_url}
                      className="h-full w-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <p className="max-w-[200px] text-[11px] text-gray-600">
                      Video yükleniyor...<br />
                      <span className="text-[10px] text-gray-700">
                        (S3 + CloudFront CDN)
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Üst gradient – segment bilgisi okunur olsun */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />

              {/* Alt gradient – butonlar için */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* ----- Segment rozeti (sol üst) ----- */}
              <div className="absolute left-3 top-4 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 shadow-lg backdrop-blur-sm border border-amber-700/30">
                  <SegmentIcon segment={currentCar.segment} />
                  {currentCar.segment}
                </span>
              </div>

              {/* ----- Sıra bilgisi (sağ üst) ----- */}
              <div className="absolute right-3 top-4 z-10">
                <span className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-mono font-bold text-white/60 backdrop-blur-sm">
                  {safeIndex + 1} / {cars.length}
                </span>
              </div>

              {/* ----- Alt bilgi paneli ----- */}
              <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 px-5 pb-6">
                {/* Araç başlığı */}
                <h2 className="text-lg font-bold text-white drop-shadow-lg">
                  {currentCar.brand} {currentCar.model}
                </h2>
                <p className="mt-0.5 text-sm text-gray-300">
                  {currentCar.year} &middot;{" "}
                  {new Intl.NumberFormat("tr-TR").format(currentCar.km)} km
                </p>

                {/* Esnaf notu */}
                {currentCar.esnaf_notu && (
                  <p className="mt-1.5 max-w-xs text-[11px] italic leading-relaxed text-gray-400 line-clamp-2">
                    &ldquo;{currentCar.esnaf_notu}&rdquo;
                  </p>
                )}

                {/* Fiyat */}
                <p className="mt-2 text-2xl font-black tracking-tight text-amber-400 drop-shadow-lg">
                  {formatPrice(currentCar.price)} ₺
                </p>

                {/* Butonlar */}
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-800/80 px-4 py-3 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-gray-700 active:bg-gray-900 border border-gray-700/40"
                  >
                    <span>🔍</span>
                    Aracı İncele
                  </button>
                  <button
                    type="button"
                    onClick={handleKapora}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/30 transition-all hover:bg-green-500 active:bg-green-700"
                  >
                    <span>💬</span>
                    Wp ile Kaporala
                  </button>
                </div>
              </div>

              {/* Yukarı/aşağı ok ipuçları */}
              <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 items-center justify-between px-2">
                {safeIndex > 0 && (
                  <span className="rounded-full bg-black/30 p-1.5 text-xs text-white/40 backdrop-blur-sm">
                    ▲
                  </span>
                )}
                {safeIndex < cars.length - 1 && (
                  <span className="ml-auto rounded-full bg-black/30 p-1.5 text-xs text-white/40 backdrop-blur-sm">
                    ▼
                  </span>
                )}
              </div>
            </>
          ) : (
            /* Hiç araç yoksa */
            <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-600">
              <span className="text-6xl opacity-20">📭</span>
              <p className="text-sm">Akışta gösterilecek araç bulunamadı.</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 rounded-lg bg-gray-800 px-5 py-2 text-sm font-bold text-white hover:bg-gray-700"
              >
                Kapat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ----- Kapatma çarpısı (sağ üst) ----- */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
        aria-label="Kapat"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Segment ikonu (minik yardımcı)                                           */
/* -------------------------------------------------------------------------- */

function SegmentIcon({ segment }: { segment: string }) {
  const map: Record<string, string> = {
    Kelepir: "💸",
    "Orta Direk": "⚖️",
    Premium: "👑",
    "Yayla Kan": "🐂",
  };
  return <span>{map[segment] ?? "🚗"}</span>;
}
