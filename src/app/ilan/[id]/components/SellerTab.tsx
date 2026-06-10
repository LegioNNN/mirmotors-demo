/* ======================================================================== */
/*  SellerTab - "Satici" sekmesi (iletisim karti, guven notu)               */
/* ======================================================================== */

interface Props {
  onWpClick: () => void;
  wpLoading: boolean;
}

export default function SellerTab({ onWpClick, wpLoading }: Props) {
  return (
    <div className="mt-6 space-y-4">
      {/* Iletisim Karti */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#111827] to-gray-700 text-lg font-black text-white shadow-sm">
            SO
          </div>
          <div>
            <h3 className="text-lg font-black text-[#111827]">Sancaktar Otomotiv</h3>
            <p className="text-sm font-medium text-gray-500">Istanbul &mdash; 750+ Arac</p>
            <div className="mt-1 flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[11px] font-medium text-green-600">Dogrulanmis Satici</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
            <svg className="h-5 w-5 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div>
              <p className="text-xs font-medium text-gray-500">Konum</p>
              <p className="text-sm font-semibold text-gray-800">Ankara / Ostim &mdash; Istanbul / Harem</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
            <svg className="h-5 w-5 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <div>
              <p className="text-xs font-medium text-gray-500">Telefon</p>
              <p className="text-sm font-semibold text-gray-800">0555 555 55 55</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
            <svg className="h-5 w-5 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <p className="text-xs font-medium text-gray-500">Calisma Saatleri</p>
              <p className="text-sm font-semibold text-gray-800">
                Hafta Ici 09:00 &middot; 19:00 &middot; Cmt 10:00 &middot; 17:00
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onWpClick}
          disabled={wpLoading}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-green-800 to-green-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:from-green-700 hover:to-green-600 hover:shadow-md active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {wpLoading ? "Yukleniyor..." : "WhatsApp ile Iletisim"}
        </button>
      </div>

      {/* Guven Notu Premium Kart */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-400 text-white shadow-sm">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#111827]">Esnaf Guven Notu</h4>
            <p className="text-xs text-gray-500">Sancaktar Otomotiv</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-gray-600">
          Biz malimizin arkasindayiz ama ticaret baska, guven baska. Begenegin araci ustani/eksperini
          al gel, dukkanimizda durustce baktir. Herhangi bir sorun cikarsa sartlarimizi konusur, ortak
          bir yol buluruz. Amacimiz kisa vadeli kar degil, uzun vadeli memnuniyet.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
            Guvenilir
          </span>
          <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-medium text-sky-700 border border-sky-200">
            Profesyonel
          </span>
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200">
            Esnaf
          </span>
          <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-medium text-purple-700 border border-purple-200">
            Referansli
          </span>
        </div>
      </div>
    </div>
  );
}
