"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Car } from "@/types";
import { getCarImage } from "@/utils/carImages";
import { generateWhatsAppUrl } from "@/utils/whatsappBalancer";
import { brand } from "@/config/brand";

interface Props {
  open: boolean;
  onClose: () => void;
  cars: Car[];
  initialIndex?: number;
}

const fmt = (n: number) => new Intl.NumberFormat("tr-TR").format(n);

/* ─── Fotoğraf grid ─────────────────────────────────────────
   1 foto  → tam ekran
   2 foto  → üst/alt eşit
   3+ foto → üstte büyük 1 + altta 2 yan yana (max 3 göster)
─────────────────────────────────────────────────────────── */
function PhotoGrid({ car }: { car: Car }) {
  const allImgs = car.images?.length ? car.images : [getCarImage(car.id)];
  const top = allImgs[0];
  const bot = allImgs[1];

  return (
    <div className="absolute inset-x-0 top-0 flex flex-col gap-0.5 bg-black" style={{ height: "60%" }}>
      {/* Üst foto */}
      <div className="relative flex-1 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={top} alt="" className="h-full w-full object-cover" loading="eager" />
      </div>
      {/* Alt foto */}
      {bot && (
        <div className="relative flex-1 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bot} alt="" className="h-full w-full object-cover" loading="eager" />
          {allImgs.length > 2 && (
            <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 backdrop-blur-sm">
              <span className="text-sm font-black text-white">+{allImgs.length - 2}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function isTikTokUrl(url: string) {
  return url.includes("tiktok.com");
}

function getTikTokEmbedUrl(url: string) {
  const match = url.match(/\/video\/(\d+)/);
  if (match) return `https://www.tiktok.com/embed/v2/${match[1]}?autoplay=1&muted=0`;
  return null;
}

/* ─── Tek araç kartı ─── */
function CarSlide({ car, active }: { car: Car; active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (active) videoRef.current.play().catch(() => {});
    else { videoRef.current.pause(); videoRef.current.currentTime = 0; }
  }, [active]);

  const tiktokEmbed = car.video_url && isTikTokUrl(car.video_url)
    ? getTikTokEmbedUrl(car.video_url)
    : null;

  return (
    <div className="absolute inset-0">
      {tiktokEmbed ? (
        <div className="relative h-full w-full overflow-hidden">
          {/* iframe büyütüp kırp: sağ butonlar + alt TikTok UI gizle */}
          <iframe
            src={tiktokEmbed}
            className="absolute border-0"
            style={{ width: "130%", height: "130%", left: "-15%", top: 0 }}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
          {/* Tıklamaları engelle */}
          <div className="absolute inset-0 z-10" />
        </div>
      ) : car.video_url ? (
        <video
          ref={videoRef}
          src={car.video_url}
          className="h-full w-full object-cover"
          loop playsInline autoPlay={active}
        />
      ) : (
        <PhotoGrid car={car} />
      )}
      {/* gradyanlar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black via-black/60 to-transparent" />
    </div>
  );
}

/* ─── Modal ─── */
export default function SancakTokModal({ open, onClose, cars, initialIndex = 0 }: Props) {
  const router = useRouter();
  const [idx, setIdx] = useState(initialIndex);
  const [animDir, setAnimDir] = useState<"up" | "down" | null>(null);
  const touchStartY = useRef<number | null>(null);
  const animTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAnimating = useRef(false);

  const total = cars.length;
  const safeIdx = Math.max(0, Math.min(idx, total - 1));
  const car = cars[safeIdx];

  const go = useCallback((dir: "up" | "down") => {
    if (isAnimating.current) return;
    const next = dir === "up" ? safeIdx + 1 : safeIdx - 1;
    if (next < 0 || next >= total) return;
    isAnimating.current = true;
    setAnimDir(dir);
    if (animTimeout.current) clearTimeout(animTimeout.current);
    animTimeout.current = setTimeout(() => {
      setIdx(next);
      setAnimDir(null);
      isAnimating.current = false;
    }, 200);
  }, [safeIdx, total]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown" || e.key === "ArrowRight") go("up");
      if (e.key === "ArrowUp"   || e.key === "ArrowLeft")  go("down");
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose, go]);

  // TikTok video bitince sonraki araca geç
  const currentCar = cars[Math.max(0, Math.min(idx, cars.length - 1))];
  const isTikTok = !!(currentCar?.video_url && currentCar.video_url.includes("tiktok.com"));

  useEffect(() => {
    if (!open || !isTikTok) return;

    // TikTok embed postMessage dinle
    const onMsg = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (
          data?.type === "onStateChange" && data?.value === "ended" ||
          data?.type === "VIDEO_END" ||
          data?.event === "ended"
        ) {
          go("up");
        }
      } catch {}
    };
    window.addEventListener("message", onMsg);

    // Fallback: 60sn sonra otomatik geç
    const timer = setTimeout(() => go("up"), 60_000);

    return () => {
      window.removeEventListener("message", onMsg);
      clearTimeout(timer);
    };
  }, [open, isTikTok, idx, go]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    go(e.deltaY > 0 ? "up" : "down");
  }, [go]);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    touchStartY.current = null;
    if (Math.abs(diff) < 40) return;
    go(diff > 0 ? "up" : "down");
  };

  const handleWp = useCallback(() => {
    if (!car) return;
    window.open(generateWhatsAppUrl(brand.primaryPhone.replace("+", ""), car.brand, car.model, car.year), "_blank", "noopener,noreferrer");
  }, [car]);

  const handleDetail = useCallback(() => {
    if (!car) return;
    onClose();
    router.push(`/ilan/${car.id}`);
  }, [car, onClose, router]);

  if (!open || !car) return null;

  const slideClass = animDir === "up"
    ? "-translate-y-6 opacity-0"
    : animDir === "down"
    ? "translate-y-6 opacity-0"
    : "translate-y-0 opacity-100";

  return (
    <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">

      {/* X kapat */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-white/20"
        aria-label="Kapat"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {/* Sayaç */}
      <div className="absolute left-4 top-4 z-50 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white/80 backdrop-blur-sm">
        {safeIdx + 1} / {total}
      </div>

      {/* Görsel + içerik — desktop'ta telefon çerçevesi */}
      <div
        className="relative flex items-center justify-center lg:h-auto lg:w-auto"
        style={{ height: "100%", width: "100%" }}
      >
        {/* Telefon çerçevesi (sadece desktop) */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          {/* dış gölge / arka plan blur */}
        </div>

        <div
          className={`
            relative w-full max-w-sm transition-all duration-200 ease-out
            lg:rounded-[2.8rem] lg:border-[6px] lg:border-white/10 lg:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_32px_80px_rgba(0,0,0,0.8)]
            lg:overflow-hidden
            h-full lg:h-[88vh] lg:max-h-[820px]
            ${slideClass}
          `}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Notch */}
          <div className="absolute left-1/2 top-3 z-50 hidden h-6 w-24 -translate-x-1/2 rounded-full bg-black lg:block" />

        <CarSlide car={car} active={animDir === null} />

        {/* Segment rozeti */}
        {car.segment && (
          <div className="absolute left-4 top-14 z-10">
            <span className="rounded-full bg-black/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-400 border border-amber-700/30">
              {car.segment}
            </span>
          </div>
        )}
        {car.video_url && (
          <div className="absolute right-4 top-14 z-10">
            <span className="rounded-full bg-red-600/80 px-2.5 py-1 text-[11px] font-bold text-white">▶ Video</span>
          </div>
        )}

        {/* Alt bilgi */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-8 pt-4">
          <p className="text-sm font-bold uppercase tracking-widest text-white/50">{car.brand}</p>
          <h2 className="mt-0.5 text-3xl font-black leading-tight text-white">{car.model}</h2>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-base font-bold text-white">{car.year}</span>
            <span className="text-white/30">·</span>
            <span className="text-base font-bold text-white">{fmt(car.km)} km</span>
            <span className="text-white/30">·</span>
            <span className="text-base font-semibold text-white/80">{car.fuel_type}</span>
            <span className="text-white/30">·</span>
            <span className="text-base font-semibold text-white/80">{car.transmission}</span>
          </div>


          <p className="mt-3 text-4xl font-black tracking-tight text-amber-400">
            {car.price > 0 ? `${fmt(car.price)} ₺` : "Fiyat için ara"}
          </p>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleDetail}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 py-4 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              İncele
            </button>
            <button
              type="button"
              onClick={handleWp}
              className="flex flex-[1.6] items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-4 text-sm font-bold text-white shadow-lg transition hover:brightness-110 active:scale-95"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp&apos;tan Sor
            </button>
          </div>
        </div>
        </div>{/* telefon iç div kapanışı */}
      </div>{/* wrapper kapanışı */}

      {/* Desktop ok tuşları */}
      <button type="button" onClick={() => go("down")} disabled={safeIdx === 0}
        className="absolute left-4 top-1/2 z-50 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-20 lg:flex">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="18 15 12 9 6 15"/></svg>
      </button>
      <button type="button" onClick={() => go("up")} disabled={safeIdx === total - 1}
        className="absolute right-4 top-1/2 z-50 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-20 lg:flex">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
    </div>
  );
}
