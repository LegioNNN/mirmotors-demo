"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Car, CarSegment } from "@/types";
import { createKaporaLink } from "@/utils/whatsappBalancer";
import { getCarImage } from "@/utils/carImages";
import { trackWhatsappClick } from "@/utils/trackWhatsappClick";
import { brand } from "@/config/brand";
import ShareButton from "@/components/ui/ShareButton";

/* -------------------------------------------------------------------------- */
/*  Segment config                                                             */
/* -------------------------------------------------------------------------- */

type SegmentStyle = {
  label: string;
  cls: string;
};

const segmentConfig: Record<CarSegment, SegmentStyle> = {
  Kelepir: {
    label: "FIRSAT",
    cls: "bg-green-700 text-white",
  },
  "Orta Direk": {
    label: "ORTA SEGMENT",
    cls: "bg-[#1e3a5f] text-white",
  },
  Premium: {
    label: "PREMIUM",
    cls: "bg-[#111827] text-amber-400",
  },
  "Yayla Kan": {
    label: "EKONOMİK",
    cls: "bg-gray-600 text-white",
  },
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat("tr-TR").format(n);

const formatKm = (n: number) =>
  new Intl.NumberFormat("tr-TR").format(n);

interface CarCardProps {
  car: Car;
  onCompare?: (id: string, checked: boolean) => void;
  isCompared?: boolean;
}

export default function CarCard({ car }: CarCardProps) {
  const seg = segmentConfig[car.segment];
  const uploadedImage = car.images?.[0]?.trim();
  const carImage = uploadedImage || getCarImage(car.id);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const router = useRouter();

  const isSold = car.status === "Satıldı";
  const isOptioned = (car.status as string) === "Opsiyonlu" || car.status === "Kaporalandı";
  const isFeatured = car.is_featured === true;
  const hasEsnafNotu = car.esnaf_notu && car.esnaf_notu.trim().length > 0;

  const handleCardClick = useCallback(() => {
    router.push(`/ilan/${car.id}`);
  }, [router, car.id]);

  const handleWp = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const result = await createKaporaLink(car.brand, car.model, car.year);
    if (result) {
      const message = `Selamın aleyküm ${brand.name}, sitenizdeki ${car.brand} ${car.model} ${car.year} ilanı için kapora gönderip aracı ayırtmak istiyorum. Hesap numarası alabilir miyim?`;
      trackWhatsappClick({
        car_id: car.id,
        car_brand: car.brand,
        car_model: car.model,
        car_year: car.year,
        car_price: car.price,
        source: "car_card",
        phone_target: result.url.match(/wa\.me\/(\d+)/)?.[1] ?? "",
        message,
      });
      window.open(result.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group relative flex flex-col overflow-hidden rounded-xl bg-white border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        isSold
          ? "border-gray-200 opacity-60 grayscale-[30%]"
          : isOptioned
          ? "border-amber-200 shadow-sm shadow-amber-50"
          : isFeatured
          ? "border-gray-300 shadow-sm ring-1 ring-gray-200"
          : "border-gray-200 shadow-sm"
      }`}
    >
      {/* Görsel */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        {!imgError ? (
          <>
            <img
              src={carImage}
              alt={`${car.brand} ${car.model}`}
              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
            {!imgLoaded && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse" />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
              <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
              <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
            </svg>
          </div>
        )}

        {/* Segment badge — sol üst */}
        {!isSold && !isFeatured && (
          <span className={`absolute left-2.5 top-2.5 z-10 rounded px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase ${seg.cls}`}>
            {seg.label}
          </span>
        )}

        {/* Öne çıkan badge */}
        {!isSold && isFeatured && (
          <span className="absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded bg-[#111827]/90 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase text-amber-400">
            <svg className="h-2 w-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            ÖNE ÇIKAN
          </span>
        )}

        {/* Video badge */}
        {car.video_url && !isSold && (
          <span className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1 rounded bg-black/70 px-2 py-0.5 text-[9px] font-bold text-white">
            <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Video
          </span>
        )}

        {/* Satıldı overlay — psikoloji: hızlı satıldı, sen de acele et */}
        {isSold && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/55 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-4xl leading-none">💰</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-black tracking-[0.2em] text-white uppercase">
                Satıldı
              </span>
            </div>
          </div>
        )}

        {/* Kaporalandı overlay — diyagonal şerit efekti */}
        {isOptioned && (
          <>
            <div className="absolute inset-0 z-10 bg-amber-950/30 backdrop-blur-[1px]" />
            {/* Köşe şeridi */}
            <div className="absolute z-20 top-0 right-0 overflow-hidden w-28 h-28 pointer-events-none">
              <div className="absolute top-5 right-[-30px] w-36 py-1.5 bg-amber-500 rotate-45 text-center">
                <span className="text-[9px] font-black tracking-[0.2em] text-white uppercase">Kapora</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* İçerik */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">

        {/* Marka / Model */}
        <h3 className="text-sm font-extrabold text-[#111827] leading-tight sm:text-base truncate">
          {car.brand} <span className="font-semibold text-gray-500">{car.model}</span>
        </h3>

        {/* Spec — mobilde iki satır, masaüstünde tek satır */}
        <div className="mt-1.5 text-[11px] text-gray-500 sm:text-xs">
          <span className="font-semibold text-gray-700">{car.year}</span>
          <span className="mx-1 text-gray-300">·</span>
          <span>{formatKm(car.km)} km</span>
          <br className="sm:hidden" />
          <span className="hidden sm:inline"><span className="mx-1 text-gray-300">·</span>{car.fuel_type}<span className="mx-1 text-gray-300">·</span>{car.transmission}</span>
          <span className="sm:hidden text-gray-400">{car.fuel_type} · {car.transmission}</span>
        </div>

        {/* Fiyat */}
        <div className="mt-auto pt-2.5">
          {car.price > 0 ? (
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-black text-[#111827] tracking-tight sm:text-2xl">
                {formatPrice(car.price)}
              </span>
              <span className="text-xs font-bold text-gray-400 sm:text-sm">TL</span>
            </div>
          ) : (
            <span className="text-sm font-bold text-gray-500">Fiyat sorunuz</span>
          )}
        </div>

        {/* Butonlar */}
        {!isSold ? (
          <div className="mt-2.5 flex gap-1.5 sm:gap-2">
            <Link
              href={`/ilan/${car.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 rounded-lg bg-[#111827] px-2 py-2.5 text-center text-[11px] font-bold text-white transition-colors hover:bg-gray-800 sm:px-4 sm:text-xs"
            >
              İncele
            </Link>
            <button
              type="button"
              onClick={handleWp}
              className="flex items-center justify-center gap-1 rounded-lg bg-[#25D366] px-3 py-2.5 text-[11px] font-bold text-white transition-opacity hover:opacity-90 sm:gap-1.5 sm:px-4 sm:text-xs"
            >
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="hidden sm:inline">WA</span>
            </button>
            <ShareButton url={`/ilan/${car.id}`} title={`${car.brand} ${car.model} ${car.year} — ${new Intl.NumberFormat("tr-TR").format(car.price)} TL`} variant="icon" />
          </div>
        ) : (
          <div className="mt-2.5 rounded-lg bg-gray-50 border border-gray-100 py-2 text-center text-[11px] font-semibold text-gray-400">
            Satılmıştır
          </div>
        )}
      </div>
    </article>
  );
}
