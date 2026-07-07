"use client";

import type { ExpertisePart } from "@/utils/detailFormatters";
import { brand } from "@/config/brand";

interface Props {
  parts: ExpertisePart[];
  orijinalCount: number;
  lokalBoyaliCount: number;
  boyaliCount: number;
  degisenCount: number;
}

/* ── Sahibinden 4-renk sistemi ── */
const STATUS: Record<ExpertisePart["status"], { label: string; short: string; bg: string; border: string; text: string; dot: string }> = {
  orijinal:     { label: "Orijinal",     short: "O",  bg: "bg-gray-100",   border: "border-gray-300",   text: "text-gray-600",   dot: "bg-gray-400"   },
  lokal_boyali: { label: "Lokal Boyalı", short: "LB", bg: "bg-orange-100", border: "border-orange-400", text: "text-orange-700", dot: "bg-orange-500" },
  boyali:       { label: "Boyalı",       short: "B",  bg: "bg-blue-100",   border: "border-blue-400",   text: "text-blue-700",   dot: "bg-blue-500"   },
  degisen:      { label: "Değişen",      short: "D",  bg: "bg-red-100",    border: "border-red-400",    text: "text-red-700",    dot: "bg-red-500"    },
};

function getStatus(parts: ExpertisePart[], label: string): ExpertisePart["status"] {
  const found = parts.find((p) => p.label === label);
  return found?.status ?? "orijinal";
}

/* ── Tek parça bloğu ── */
function Block({ label, status }: { label: string; status: ExpertisePart["status"] }) {
  const st = STATUS[status];
  const isOri = status === "orijinal";
  return (
    <div className={`flex items-center justify-between rounded-md border px-2.5 py-2 ${isOri ? "border-gray-200 bg-gray-50" : `${st.bg} ${st.border}`}`}>
      <span className={`text-[11px] font-medium leading-tight ${isOri ? "text-gray-500" : st.text}`}>{label}</span>
      {!isOri && (
        <span className={`ml-1.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black ${st.bg} ${st.text}`}>{st.short}</span>
      )}
    </div>
  );
}

/* ── Sütun başlığı ── */
function ColHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">{children}</p>
  );
}

export default function ExpertiseTab({ parts, orijinalCount, lokalBoyaliCount, boyaliCount, degisenCount }: Props) {
  const gs = (label: string) => getStatus(parts, label);

  /* Orijinal dışındaki parçalar — liste için */
  const nonOri = parts.filter((p) => p.status !== "orijinal");
  const lokalList  = nonOri.filter((p) => p.status === "lokal_boyali");
  const boyaliList = nonOri.filter((p) => p.status === "boyali");
  const degisenList= nonOri.filter((p) => p.status === "degisen");

  return (
    <div className="mt-5 space-y-4">

      {/* Uyarı bandı */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <p className="text-xs leading-relaxed text-amber-800">
          Bu ekspertiz bilgileri <strong>{brand.name} çalışanları</strong> tarafından girilmiştir.
          Kesin tespit için kendi ekspernize gösterebilirsiniz.
        </p>
      </div>

      {/* Ana şema — Sahibinden düzeni */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">

        {/* Renk açıklamaları */}
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {(Object.entries(STATUS) as [ExpertisePart["status"], typeof STATUS[keyof typeof STATUS]][]).map(([key, st]) => (
            <span key={key} className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
              <span className={`h-3 w-3 rounded-sm ${st.dot}`}/>
              {st.label}
            </span>
          ))}
        </div>

        {/* 3 sütun: sol taraf | orta gövde | sağ taraf */}
        <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 sm:grid-cols-[1fr_1.2fr_1fr]">

          {/* SOL TARAF */}
          <div>
            <ColHeader>Sol Taraf</ColHeader>
            <div className="space-y-1.5">
              <Block label="Sol Ön Çamurluk"  status={gs("Sol On Camurluk")} />
              <Block label="Sol Ön Kapı"       status={gs("Sol On Kapi")} />
              <Block label="Sol Arka Kapı"     status={gs("Sol Arka Kapi")} />
              <Block label="Sol Arka Çamurluk" status={gs("Sol Arka Camurluk")} />
            </div>
          </div>

          {/* ORTA GÖVDE */}
          <div>
            <ColHeader>Gövde</ColHeader>
            <div className="space-y-1.5">
              <Block label="Ön Tampon" status={gs("On Tampon")} />
              <Block label="Kaput"     status={gs("Kaput")} />
              <Block label="Tavan"     status={gs("Tavan")} />
              <Block label="Bagaj"     status={gs("Bagaj")} />
              <Block label="Arka Tampon" status={gs("Arka Tampon")} />
            </div>
          </div>

          {/* SAĞ TARAF */}
          <div>
            <ColHeader>Sağ Taraf</ColHeader>
            <div className="space-y-1.5">
              <Block label="Sağ Ön Çamurluk"  status={gs("Sag On Camurluk")} />
              <Block label="Sağ Ön Kapı"       status={gs("Sag On Kapi")} />
              <Block label="Sağ Arka Kapı"     status={gs("Sag Arka Kapi")} />
              <Block label="Sağ Arka Çamurluk" status={gs("Sag Arka Camurluk")} />
            </div>
          </div>
        </div>

        {/* Özet sayaçlar */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
          {[
            { key: "orijinal",     count: orijinalCount,     ...STATUS.orijinal     },
            { key: "lokal_boyali", count: lokalBoyaliCount,  ...STATUS.lokal_boyali },
            { key: "boyali",       count: boyaliCount,        ...STATUS.boyali       },
            { key: "degisen",      count: degisenCount,       ...STATUS.degisen      },
          ].map(({ key, count, label, bg, border, text }) => (
            <span key={key} className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold ${bg} ${border} ${text}`}>
              {label}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* Orijinal olmayan parçalar listesi — sadece varsa */}
      {nonOri.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
            Boyalı veya Değişen Parçalar
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {([
              { list: lokalList,   ...STATUS.lokal_boyali },
              { list: boyaliList,  ...STATUS.boyali       },
              { list: degisenList, ...STATUS.degisen      },
            ] as { list: ExpertisePart[]; label: string; dot: string; text: string }[]).map(({ list, label, dot, text }) =>
              list.length > 0 ? (
                <div key={label}>
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-sm ${dot}`}/>
                    <span className={`text-[11px] font-bold ${text}`}>{label} Parçalar</span>
                  </div>
                  <ul className="space-y-0.5">
                    {list.map((p) => (
                      <li key={p.label} className={`text-xs ${text} before:mr-1.5 before:content-['·']`}>{p.label}</li>
                    ))}
                  </ul>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  );
}
