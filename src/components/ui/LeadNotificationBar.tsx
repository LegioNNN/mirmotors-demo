"use client";

interface LeadNotificationBarProps {
  pendingCount: number;
  todayCount: number;
  overdueCount: number;
  onFilterChange: (filter: "pending" | "today" | "overdue") => void;
}

export default function LeadNotificationBar({
  pendingCount,
  todayCount,
  overdueCount,
  onFilterChange,
}: LeadNotificationBarProps) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Bekliyor */}
      <button
        type="button"
        onClick={() => onFilterChange("pending")}
        className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-left transition-colors hover:bg-blue-100/80"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
          <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Onay Bekleyen</p>
          <p className="text-lg font-black text-blue-900">{pendingCount}</p>
        </div>
      </button>

      {/* Bugün Dönüş */}
      <button
        type="button"
        onClick={() => onFilterChange("today")}
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
          todayCount > 0
            ? "border-blue-400 bg-blue-50 hover:bg-blue-100/80"
            : "border-gray-200 bg-gray-50 opacity-60"
        }`}
      >
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          todayCount > 0 ? "bg-blue-200" : "bg-gray-200"
        }`}>
          <svg className={`h-5 w-5 ${
            todayCount > 0 ? "text-blue-700" : "text-gray-500"
          }`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${
            todayCount > 0 ? "text-blue-800" : "text-gray-500"
          }`}>Bugün Dönüş</p>
          <p className={`text-lg font-black ${
            todayCount > 0 ? "text-blue-900" : "text-gray-500"
          }`}>{todayCount}</p>
        </div>
      </button>

      {/* Gecikenler */}
      <button
        type="button"
        onClick={() => onFilterChange("overdue")}
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
          overdueCount > 0
            ? "border-red-300 bg-red-50 hover:bg-red-100/80"
            : "border-gray-200 bg-gray-50 opacity-60"
        }`}
      >
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          overdueCount > 0 ? "bg-red-100" : "bg-gray-200"
        }`}>
          <svg className={`h-5 w-5 ${
            overdueCount > 0 ? "text-red-600" : "text-gray-500"
          }`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${
            overdueCount > 0 ? "text-red-800" : "text-gray-500"
          }`}>Gecikenler</p>
          <p className={`text-lg font-black ${
            overdueCount > 0 ? "text-red-900" : "text-gray-500"
          }`}>{overdueCount}</p>
        </div>
      </button>
    </div>
  );
}

