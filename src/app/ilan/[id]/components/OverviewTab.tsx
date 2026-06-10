/* ======================================================================== */
/*  OverviewTab - "Genel Bakis" sekmesi                                      */
/* ======================================================================== */

import type { Car } from "@/types";
import DetailSpecBox from "./DetailSpecBox";
import { formatKm } from "@/utils/detailFormatters";

interface Props {
  car: Car;
}

export default function OverviewTab({ car }: Props) {
  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DetailSpecBox label="Model Yili" value={String(car.year)} />
        <DetailSpecBox label="Kilometre" value={`${formatKm(car.km)} km`} />
        <DetailSpecBox label="Yakit Tipi" value={car.fuel_type} />
        <DetailSpecBox label="Sanziman" value={car.transmission} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-800 to-green-700 text-white shadow-sm">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-[#111827]">Guvenilir Ekspertiz</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              Biz malimizin arkasindayiz ama ticaret baska, guven baska.
              Begenegin araci ustani/eksperini al gel, dukkanimizda durustce baktir.
              Herhangi bir sorun cikarsa sartlarimizi konusuruz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
