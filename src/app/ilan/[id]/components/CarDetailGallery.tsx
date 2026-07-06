"use client";

import { useState, useRef } from "react";
import type { CarSegment } from "@/types";
import type { SegmentStyle } from "@/utils/detailFormatters";
import CarPlaceholder from "./CarPlaceholder";

interface Props {
  images: string[];
  brand: string;
  model: string;
  segment: CarSegment;
  segStyle: SegmentStyle;
  videoUrl?: string;
}

export default function CarDetailGallery({ images, brand, model, segStyle, videoUrl }: Props) {
  const [selected, setSelected] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const mainRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const total = images.length;

  const goTo = (idx: number) => {
    setSelected(idx);
    // Ana görsel container'ını scroll et
    if (mainRef.current) {
      mainRef.current.scrollTo({ left: idx * mainRef.current.clientWidth, behavior: "smooth" });
    }
    // Thumbnail container'ını scroll et
    scrollRef.current?.children[idx]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const prev = () => goTo(Math.max(0, selected - 1));
  const next = () => goTo(Math.min(total - 1, selected + 1));

  return (
    <div className="min-w-0 overflow-hidden lg:col-span-7">

      {/* Ana görsel — swipe destekli */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 sm:rounded-2xl">
        {/* Kaydırılabilir görseller (mobile swipe) */}
        <div
          ref={mainRef}
          className="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={(e) => {
            const el = e.currentTarget;
            const idx = Math.round(el.scrollLeft / el.clientWidth);
            setSelected(idx);
          }}
        >
          {images.map((img, idx) => (
            <div key={idx} className="snap-center h-full w-full shrink-0">
              {!imgErrors[idx] && img ? (
                <img
                  src={img}
                  alt={`${brand} ${model} - ${idx + 1}`}
                  className="h-full w-full object-cover"
                  onError={() => setImgErrors((p) => ({ ...p, [idx]: true }))}
                />
              ) : (
                <CarPlaceholder />
              )}
            </div>
          ))}
        </div>

        {/* Sol / sağ ok — masaüstünde */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              disabled={selected === 0}
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              disabled={selected === total - 1}
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {/* Segment rozeti */}
        <div className={`absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 backdrop-blur-sm ${segStyle.wrapper}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${segStyle.accentDot}`} />
          {segStyle.label}
        </div>

        {/* Görsel sayacı */}
        {total > 1 && (
          <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            {selected + 1} / {total}
          </div>
        )}

        {/* Nokta indikatörler — mobilde */}
        {total > 1 && total <= 12 && (
          <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 flex items-center gap-1.5 sm:hidden">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goTo(idx)}
                className={`h-1.5 rounded-full transition-all ${idx === selected ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail galerisi — masaüstünde */}
      {total > 1 && (
        <div ref={scrollRef} className="mt-2.5 hidden sm:flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goTo(idx)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                idx === selected
                  ? "border-[#111827] ring-1 ring-[#111827]"
                  : "border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300"
              }`}
            >
              {!imgErrors[idx] && img ? (
                <img
                  src={img}
                  alt={`${brand} ${model} - ${idx + 1}`}
                  className="h-full w-full object-cover"
                  onError={() => setImgErrors((p) => ({ ...p, [idx]: true }))}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-[10px] text-gray-300">—</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Video — varsa */}
      {videoUrl && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span className="text-sm font-bold text-gray-700">Araç Videosu</span>
          </div>
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-900">
            {/* R2 doğrudan MP4 → native video; embed URL → iframe */}
            {/\.(mp4|webm|mov|avi)(\?|$)/i.test(videoUrl) ? (
              <video
                src={videoUrl}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full object-contain"
                title={`${brand} ${model} video`}
              />
            ) : (
              <iframe
                src={videoUrl}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`${brand} ${model} video`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
