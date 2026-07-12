"use client";

/* ======================================================================== */
/*  StepIndicator - 4 adimli premium progress gostergesi                     */
/*  Tamamlanan adimlar, aktif adim, bekleyen adim net ayrim                */
/*  Mobilde tasmayacak sekilde responsive                                    */
/* ======================================================================== */

type Adim = 1 | 2 | 3 | 4;

interface StepIndicatorProps {
  adim: Adim;
}

const adimEtiketleri: Record<Adim, { kisa: string; uzun: string }> = {
  1: { kisa: "Araç Bilgi", uzun: "Araç Bilgileri" },
  2: { kisa: "Durum", uzun: "Araç Durumu" },
  3: { kisa: "Fiyat", uzun: "Fiyat Beklentisi" },
  4: { kisa: "İletişim", uzun: "İletişim ve Onay" },
};

export default function StepIndicator({ adim }: StepIndicatorProps) {
  return (
    <div className="mb-6 flex items-start gap-1 sm:gap-2">
      {([1, 2, 3, 4] as Adim[]).map((s, i) => {
        const etiket = adimEtiketleri[s];
        const tamamlandi = adim > s;
        const aktif = adim === s;
        const bekliyor = adim < s;

        return (
          <div key={s} className="flex flex-1 items-center min-w-0">
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              {/* Daire */}
              <div
                className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 sm:h-10 sm:w-10 sm:text-sm ${
                  tamamlandi
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                    : aktif
                      ? "bg-amber-700 text-white ring-2 ring-amber-400 ring-offset-2 shadow-lg shadow-amber-700/30 scale-110"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {tamamlandi ? (
                  <svg
                    className="h-[18px] w-[18px] sm:h-5 sm:w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span className={aktif ? "drop-shadow-sm" : ""}>{s}</span>
                )}

                {/* Aktif adim icin nabiz efekti */}
                {aktif && (
                  <span className="absolute -inset-1 animate-ping rounded-full bg-amber-400/30" />
                )}
              </div>

              {/* Etiket - mobilde kisa, masaustunde uzun */}
              <span
                className={`truncate text-[9px] font-semibold uppercase tracking-wider transition-colors duration-200 sm:text-[10px] ${
                  tamamlandi
                    ? "text-amber-700"
                    : aktif
                      ? "text-amber-800"
                      : "text-gray-400"
                }`}
              >
                <span className="hidden sm:inline">{etiket.uzun}</span>
                <span className="sm:hidden">{etiket.kisa}</span>
              </span>
            </div>

            {/* Progress cizgisi - tamamlanan yesil, aktifte kismi yesil, bekleyen gri */}
            {i < 3 && (
              <div
                className={`relative h-[3px] flex-1 mx-1 self-start mt-[18px] sm:mt-[19px] rounded-full transition-colors duration-300 ${
                  tamamlandi
                    ? "bg-amber-500"
                    : aktif
                      ? "bg-amber-200"
                      : "bg-gray-200"
                }`}
              >
                {/* Aktif adimda kismi dolu cizgi */}
                {aktif && (
                  <div className="absolute left-0 top-0 h-full w-1/2 rounded-full bg-amber-500 transition-all duration-500" />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
