"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { Car } from "@/types";
import { createKaporaLink } from "@/utils/whatsappBalancer";
import { getCarImage } from "@/utils/carImages";
import { trackWhatsappClick } from "@/utils/trackWhatsappClick";
import { segmentConfig, parseExpertise } from "@/utils/detailFormatters";
import Navbar from "@/components/ui/Navbar";
import CarDetailGallery from "./components/CarDetailGallery";
import CarDetailSidebar from "./components/CarDetailSidebar";
import CarDetailTabs from "./components/CarDetailTabs";
import type { DetailTab } from "./components/CarDetailTabs";
import MobileWhatsappBar from "./components/MobileWhatsappBar";
import OverviewTab from "./components/OverviewTab";
import ExpertiseTab from "./components/ExpertiseTab";
import SellerTab from "./components/SellerTab";

interface Props {
  car: Car;
}

export default function CarDetailClient({ car }: Props) {
  const [activeTab, setActiveTab] = useState<"vitrin" | "sat">("vitrin");
  const [detailTab, setDetailTab] = useState<DetailTab>("genel");
  const [wpLoading, setWpLoading] = useState(false);

  const seg = segmentConfig[car.segment];
  const images = car.images?.length > 0 ? car.images : [getCarImage(car.id)];

  const doWpClick = useCallback(async (source: "vehicle_detail_sidebar" | "vehicle_detail_mobile") => {
    setWpLoading(true);
    const result = await createKaporaLink(car.brand, car.model, car.year);
    setWpLoading(false);
    if (result) {
      // Tracking - yönlendirmeyi engellemez
      const message = `Selamın aleyküm Sancaktar Otomotiv, sitenizdeki ${car.brand} ${car.model} ${car.year} ilanı için kapora gönderip aracı ayırtmak istiyorum. Hesap numarası alabilir miyim?`;
      trackWhatsappClick({
        car_id: car.id,
        car_brand: car.brand,
        car_model: car.model,
        car_year: car.year,
        car_price: car.price,
        source,
        phone_target: result.url.match(/wa\.me\/(\d+)/)?.[1] ?? "",
        message,
      });
      window.open(result.url, "_blank", "noopener,noreferrer");
    } else {
      alert("Su anda tum personelimiz yogun.");
    }
  }, [car.brand, car.model, car.year]);

  const handleWpSidebar = useCallback(() => doWpClick("vehicle_detail_sidebar"), [doWpClick]);
  const handleWpMobile = useCallback(() => doWpClick("vehicle_detail_mobile"), [doWpClick]);

  const parts = parseExpertise(car.ekspertiz_durumu);
  const orijinalCount = parts.filter((p) => p.status === "orijinal").length;
  const boyaliCount = parts.filter((p) => p.status === "boyali").length;
  const degisenCount = parts.filter((p) => p.status === "degisen").length;

  return (
    <main className="min-h-screen bg-[#f9fafb]">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <MobileWhatsappBar car={car} onClick={handleWpMobile} loading={wpLoading} />
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12">
        <nav className="mb-6 flex items-center gap-1.5 text-xs">
          <Link href="/" className="font-medium text-gray-400 transition-colors hover:text-[#111827]">Sancaktar</Link>
          <svg className="h-3 w-3 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
          <Link href="/" className="font-medium text-gray-400 transition-colors hover:text-[#111827]">Vitrin</Link>
          <svg className="h-3 w-3 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
          <span className="font-medium text-[#111827]">{car.brand} {car.model}</span>
        </nav>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <CarDetailGallery images={images} brand={car.brand} model={car.model} segment={car.segment} segStyle={seg} />
          <CarDetailSidebar car={car} onWpClick={handleWpSidebar} wpLoading={wpLoading} />
        </div>

        <div className="mt-8">
          <CarDetailTabs activeTab={detailTab} onTabChange={setDetailTab} />
          {detailTab === "genel" && <OverviewTab car={car} />}
          {detailTab === "ekspertiz" && (
            <ExpertiseTab parts={parts} orijinalCount={orijinalCount} boyaliCount={boyaliCount} degisenCount={degisenCount} />
          )}
          {detailTab === "satici" && <SellerTab onWpClick={handleWpSidebar} wpLoading={wpLoading} />}
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-all hover:text-[#111827] group">
            <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Vitrine Geri Don
          </Link>
        </div>
      </div>
      <footer className="hidden lg:block mt-12 border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        <p>Sancaktar Otomotiv &copy; {new Date().getFullYear()} &mdash; 750 Araclik Vitrin</p>
      </footer>
    </main>
  );
}

