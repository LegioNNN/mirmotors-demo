"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Car } from "@/types";
import { createKaporaLink } from "@/utils/whatsappBalancer";

interface SancakTokModalProps {
  open: boolean;
  onClose: () => void;
  cars: Car[];
  initialIndex?: number;
}

const formatPrice = (n: number) => new Intl.NumberFormat("tr-TR").format(n);

export default function SancakTokModal({ open, onClose, cars, initialIndex = 0 }: SancakTokModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number | null>(null);

  const safeIndex = Math.max(0, Math.min(currentIndex, cars.length - 1));
  const currentCar: Car | undefined = cars[safeIndex];

  const resetScroll = useCallback(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, []);

  useEffect(() => { resetScroll(); }, [safeIndex, resetScroll]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") setCurrentIndex((p) => Math.max(0, p - 1));
      if (e.key === "ArrowDown" || e.key === "ArrowRight") setCurrentIndex((p) => Math.min(cars.length - 1, p + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, cars.length]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!open) return;
    setCurrentIndex((p) => Math.max(0, Math.min(cars.length - 1, p + (e.deltaY > 0 ? 1 : -1))));
  }, [open, cars.length]);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    touchStartY.current = null;
    if (Math.abs(diff) < 30) return;
    setCurrentIndex((p) => Math.max(0, Math.min(cars.length - 1, p + (diff > 0 ? 1 : -1))));
  };

  const handleKapora = async () => {
    if (!currentCar) return;
    const result = await createKaporaLink(currentCar.brand, currentCar.model, currentCar.year);
    if (result) window.open(result.url, "_blank", "noopener,noreferrer");
    else alert("Şu anda tüm personelimiz yoğun.");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <div
        ref={containerRef}
        className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-black outline-none"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative flex-1">
          {currentCar ? (
            <>
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-black">
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="text-7xl opacity-20 select-none">🎬</span>
                  <p className="text-sm font-medium text-gray-500">{currentCar.brand} {currentCar.model}</p>
                  {currentCar.video_url ? (
                    <video src={currentCar.video_url} className="h-full w-full object-cover" autoPlay muted loop playsInline />
                  ) : (
                    <p className="max-w-[200px] text-[11px] text-gray-600">
                      Video yükleniyor...<br />
                      <span className="text-[10px] text-gray-700">(S3 + CloudFront CDN)</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="absolute left-3 top-4 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 shadow-lg backdrop-blur-sm border border-amber-700/30">
                  {currentCar.segment}
                </span>
              </div>
              <div className="absolute right-3 top-4 z-10">
                <span className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-mono font-bold text-white/60 backdrop-blur-sm">
                  {safeIndex + 1} / {cars.length}
                </span>
              </div>

              <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 px-5 pb-6">
                <h2 className="text-lg font-bold text-white drop-shadow-lg">{currentCar.brand} {currentCar.model}</h2>
                <p className="mt-0.5 text-sm text-gray-300">{currentCar.year} &middot; {new Intl.NumberFormat("tr-TR").format(currentCar.km)} km</p>
                {currentCar.esnaf_notu && (
                  <p className="mt-1.5 max-w-xs text-[11px] italic leading-relaxed text-gray-400 line-clamp-2">&ldquo;{currentCar.esnaf_notu}&rdquo;</p>
                )}
                <p className="mt-2 text-2xl font-black tracking-tight text-amber-400 drop-shadow-lg">{formatPrice(currentCar.price)} ₺</p>
                <div className="mt-4 flex gap-3">
                  <button type="button" onClick={onClose} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-800/80 px-4 py-3 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-gray-700 border border-gray-700/40">
                    Aracı İncele
                  </button>
                  <button type="button" onClick={handleKapora} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/30 transition-all hover:bg-green-500">
                    Wp ile Kaporala
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-600">
              <span className="text-6xl opacity-20">📭</span>
              <p className="text-sm">Akışta gösterilecek araç bulunamadı.</p>
              <button type="button" onClick={onClose} className="mt-4 rounded-lg bg-gray-800 px-5 py-2 text-sm font-bold text-white hover:bg-gray-700">Kapat</button>
            </div>
          )}
        </div>
      </div>
      <button type="button" onClick={onClose} className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20" aria-label="Kapat">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
