/* ======================================================================== */
/*  ExpertiseTab - "Ekspertiz" sekmesi (kroki, sayac, tablo)                 */
/* ======================================================================== */

import type { ExpertisePart } from "@/utils/detailFormatters";

interface Props {
  parts: ExpertisePart[];
  orijinalCount: number;
  boyaliCount: number;
  degisenCount: number;
}

export default function ExpertiseTab({
  parts,
  orijinalCount,
  boyaliCount,
  degisenCount,
}: Props) {
  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Arac Krokisi */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#111827] mb-4">
            Arac Krokisi (Ustten Gorunum)
          </h3>
          <svg
            viewBox="0 0 400 250"
            className="w-full max-w-md mx-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="40" y="30" width="320" height="190" rx="20" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
            <rect x="60" y="45" width="280" height="40" rx="8" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1.5" />
            <rect x="60" y="165" width="280" height="40" rx="8" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1.5" />
            <rect x="80" y="95" width="240" height="60" rx="4" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" />
            <rect x="120" y="85" width="40" height="80" rx="4" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
            <text x="140" y="130" textAnchor="middle" fontSize="10" fill="#6b7280">Kaput</text>
            <rect x="240" y="85" width="40" height="80" rx="4" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
            <text x="260" y="130" textAnchor="middle" fontSize="10" fill="#6b7280">Bagaj</text>
            <text x="200" y="130" textAnchor="middle" fontSize="10" fill="#6b7280">Tavan</text>
            <rect x="82" y="50" width="18" height="30" rx="4" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
            <rect x="300" y="50" width="18" height="30" rx="4" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
            <rect x="82" y="170" width="18" height="30" rx="4" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
            <rect x="300" y="170" width="18" height="30" rx="4" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
            <rect x="110" y="55" width="25" height="40" rx="3" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
            <rect x="110" y="105" width="25" height="40" rx="3" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
            <rect x="110" y="155" width="25" height="40" rx="3" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
            <rect x="265" y="55" width="25" height="40" rx="3" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
            <rect x="265" y="105" width="25" height="40" rx="3" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
            <rect x="265" y="155" width="25" height="40" rx="3" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
            <rect x="20" y="75" width="18" height="100" rx="6" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
            <text x="29" y="130" textAnchor="middle" fontSize="8" fill="#6b7280" transform="rotate(-90, 29, 130)">
              On
            </text>
            <rect x="362" y="75" width="18" height="100" rx="6" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
            <text x="371" y="130" textAnchor="middle" fontSize="8" fill="#6b7280" transform="rotate(90, 371, 130)">
              Arka
            </text>
          </svg>
        </div>

        {/* Sayaclar */}
        <div>
          <h3 className="text-sm font-bold text-[#111827] mb-4">Parca Durumu Ozeti</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700">
                  &#x2713;
                </span>
                <span className="text-sm font-semibold text-gray-700">Orijinal</span>
              </div>
              <span className="text-xl font-black text-emerald-700">{orijinalCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-xs font-bold text-amber-700">
                  &#x25CF;
                </span>
                <span className="text-sm font-semibold text-gray-700">Boyali</span>
              </div>
              <span className="text-xl font-black text-amber-700">{boyaliCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50/50 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-700">
                  &#x00D7;
                </span>
                <span className="text-sm font-semibold text-gray-700">Degisen</span>
              </div>
              <span className="text-xl font-black text-red-700">{degisenCount}</span>
            </div>
          </div>

          {/* Ekspertiz guven notu */}
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-2.5">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p className="text-xs leading-relaxed text-gray-500">
                Bu ekspertiz raporu Sancaktar Otomotiv tarafindan girilen bilgilere dayanmaktadir.
                Kesin tespit icin yetkili ekspere basvurmanizi tavsiye ederiz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Kaporta Tablosu */}
      <div>
        <h3 className="text-sm font-bold text-[#111827] mb-3">Kaporta Parca Durumu</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full min-w-[500px] text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-semibold text-gray-600">Parca</th>
                <th className="px-4 py-3 font-semibold text-emerald-700 text-center">Orijinal</th>
                <th className="px-4 py-3 font-semibold text-amber-700 text-center">Boyali</th>
                <th className="px-4 py-3 font-semibold text-red-700 text-center">Degisen</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2.5 font-medium text-gray-800">{part.label}</td>
                  <td className="px-4 py-2.5 text-center">
                    {part.status === "orijinal" ? (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                        &#x2713;
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {part.status === "boyali" ? (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                        &#x25CF;
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {part.status === "degisen" ? (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-700 text-xs font-bold">
                        &#x00D7;
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
