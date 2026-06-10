"use client";

/* ======================================================================== */
/*  StepIndicator - 4 adimli premium progress gostergesi                     */
/* ======================================================================== */

type Adim = 1 | 2 | 3 | 4;

interface StepIndicatorProps {
  adim: Adim;
}

const adimEtiketleri: Record<Adim, { kisa: string; uzun: string }> = {
  1: { kisa: "Arac Bilgi", uzun: "Araç Bilgileri" },
  2: { kisa: "Arac Durum", uzun: "Araç Durumu" },
  3: { kisa: "Fiyat Beklentisi", uzun: "Fiyat Beklentisi" },
  4: { kisa: "Iletisim & Onay", uzun: "İletişim ve Onay" },
};

export default function StepIndicator({ adim }: StepIndicatorProps) {
  return (
    <div className="mb-6 flex items-center gap-1 sm:gap-2">
      {([1, 2, 3, 4] as Adim[]).map((s, i) => {
        const etiket = adimEtiketleri[s];
        const tamamlandi = adim > s;
        const aktif = adim === s;
        const bekliyor = adim < s;

        return (
          <div key={s} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              {/* Daire */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 sm:h-9 sm:w-9 sm:text-sm ${
                  tamamlandi
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                    : aktif
                      ? "bg-emerald-600 text-white ring-2 ring-emerald-300 ring-offset-1 shadow-sm shadow-emerald-600/30"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {tamamlandi ? (
                  <svg className="h-4 w-4 sm:h-[18px] sm:w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  s
                )}
              </div>

              {/* Etiket - mobilde kisa, masaustunde uzun */}
              <span
                className={`text-[9px] font-semibold uppercase tracking-wider transition-colors duration-200 sm:text-[10px] ${
                  tamamlandi
                    ? "text-emerald-700"
                    : aktif
                      ? "text-[#111827]"
                      : "text-gray-400"
                }`}
              >
                <span className="hidden sm:inline">{etiket.uzun}</span>
                <span className="sm:hidden">{etiket.kisa}</span>
              </span>
            </div>

            {/* Progress cizgisi */}
            {i < 3 && (
              <div
                className={`h-[2px] flex-1 mx-1 self-start mt-4 sm:mt-[18px] rounded-full transition-colors duration-300 ${
                  tamamlandi
                    ? "bg-emerald-500"
                    : aktif
                      ? "bg-emerald-200"
                      : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

