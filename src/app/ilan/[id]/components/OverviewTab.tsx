import type { Car } from "@/types";
import { formatKm } from "@/utils/detailFormatters";

interface Props { car: Car }

function SpecRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        {icon}
      </span>
      <span className="text-xs font-medium text-gray-400 w-24 shrink-0">{label}</span>
      <span className="text-sm font-bold text-[#111827]">{value}</span>
    </div>
  );
}

export default function OverviewTab({ car }: Props) {
  return (
    <div className="mt-5 space-y-4">

      {/* Teknik Özellikler */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Teknik Özellikler</h3>
        </div>
        <div className="px-4">
          <SpecRow
            icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
            label="Model Yılı"
            value={String(car.year)}
          />
          <SpecRow
            icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
            label="Kilometre"
            value={`${formatKm(car.km)} km`}
          />
          <SpecRow
            icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 22V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14"/><path d="M13 22V12a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10"/><line x1="1" y1="22" x2="23" y2="22"/></svg>}
            label="Yakıt Tipi"
            value={car.fuel_type}
          />
          <SpecRow
            icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>}
            label="Şanzıman"
            value={car.transmission}
          />
          {car.segment && (
            <SpecRow
              icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
              label="Segment"
              value={car.segment}
            />
          )}
        </div>
      </div>

      {/* Özellikler */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Takas", sub: "Mümkün" },
          { label: "Ekspertiz", sub: "Yaptırılabilir" },
          { label: "Kredi", sub: "Uygun" },
        ].map((f) => (
          <div key={f.label} className="flex flex-col items-center gap-1 rounded-xl border border-emerald-100 bg-emerald-50 py-3">
            <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span className="text-[11px] font-bold text-emerald-800">{f.label}</span>
            <span className="text-[10px] text-emerald-600">{f.sub}</span>
          </div>
        ))}
      </div>

      {/* Güvenilir Ekspertiz notu */}
      <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <p className="text-xs leading-relaxed text-gray-500">
          Malımızın arkasındayız — ama güven ticaretten ayrıdır. Beğendiğin aracı ustanı veya eksperin alarak gelip bize baktırabilirsiniz. Herhangi bir sorun çıkarsa birlikte çözüm ararız.
        </p>
      </div>
    </div>
  );
}
