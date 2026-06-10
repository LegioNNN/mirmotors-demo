"use client";

/* ======================================================================== */
/*  CarDetailGallery - Ana gorsel galerisi (buyuk + thumbnails)             */
/* ======================================================================== */

import { useState } from "react";
import type { CarSegment } from "@/types";
import type { SegmentStyle } from "@/utils/detailFormatters";
import CarPlaceholder from "./CarPlaceholder";

interface Props {
  images: string[];
  brand: string;
  model: string;
  segment: CarSegment;
  segStyle: SegmentStyle;
}

export default function CarDetailGallery({ images, brand, model, segment, segStyle }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  return (
    <div className="lg:col-span-7">
      {/* Ana goruntu */}
      <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
        {!imgErrors[selectedImage] && images[selectedImage] ? (
          <>
            <img
              src={images[selectedImage]}
              alt={`${brand} ${model}`}
              className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
              onError={() => setImgErrors((prev) => ({ ...prev, [selectedImage]: true }))}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        ) : (
          <CarPlaceholder />
        )}

        {/* Segment rozeti - sol ust */}
        <div
          className={`absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border ${segStyle.border} ${segStyle.badge}/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${segStyle.text} backdrop-blur-sm`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${segStyle.badge}`} />
          {segStyle.label}
        </div>

        {/* Gorsel sayac - sag alt */}
        <div className="absolute bottom-4 right-4 z-10 rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {selectedImage + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail galerisi */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImage(idx)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                idx === selectedImage
                  ? "border-[#111827] ring-1 ring-[#111827]"
                  : "border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-300"
              }`}
            >
              {!imgErrors[idx] ? (
                <img
                  src={img}
                  alt={`${brand} ${model} - ${idx + 1}`}
                  className="h-full w-full object-cover"
                  onError={() => setImgErrors((prev) => ({ ...prev, [idx]: true }))}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-[10px] text-gray-300">
                  &mdash;
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
