import { brand } from "@/config/brand";

const WA_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

interface Props {
  onWpClick: () => void;
  wpLoading: boolean;
}

export default function SellerTab({ onWpClick, wpLoading }: Props) {
  return (
    <div className="mt-5 space-y-4">

      {/* Satıcı profil kartı */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 p-5 border-b border-gray-100">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-lg font-black text-white">
            {brand.shortName.charAt(0)}{brand.tagline.charAt(0)}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-black text-[#111827] truncate">{brand.name}</h3>
            <p className="text-sm text-gray-500">{brand.city} · {brand.stockText}</p>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5">
              <svg className="h-3 w-3 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="text-[10px] font-bold text-emerald-700">Doğrulanmış Galeri</span>
            </div>
          </div>
        </div>

        {/* İletişim satırları */}
        <div className="divide-y divide-gray-100">
          <div className="flex items-center gap-3 px-5 py-3.5">
            <svg className="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Konum</p>
              <p className="text-sm font-semibold text-[#111827]">{brand.district}, {brand.city}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3.5">
            <svg className="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 11.9 19.79 19.79 0 0 1 1.06 3.24 2 2 0 0 1 3 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Telefon</p>
              <a href={`tel:${brand.primaryPhone}`} className="text-sm font-semibold text-[#111827] hover:underline">
                {brand.primaryPhoneDisplay}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3.5">
            <svg className="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Çalışma Saatleri</p>
              <p className="text-sm font-semibold text-[#111827]">{brand.workingHours}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3.5">
            <svg className="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Yetki Belgesi</p>
              <p className="text-sm font-semibold text-[#111827]">No: {brand.licenseNo}</p>
            </div>
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex gap-3 p-5 border-t border-gray-100">
          <a
            href={`tel:${brand.primaryPhone}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 11.9 19.79 19.79 0 0 1 1.06 3.24 2 2 0 0 1 3 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Ara
          </a>
          <button
            type="button"
            onClick={onWpClick}
            disabled={wpLoading}
            className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d={WA_PATH}/>
            </svg>
            {wpLoading ? "Yükleniyor..." : "WhatsApp ile Yaz"}
          </button>
        </div>
      </div>

    </div>
  );
}
