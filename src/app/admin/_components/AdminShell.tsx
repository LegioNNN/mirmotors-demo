"use client";

import { useState } from "react";
import AdminDashboard from "@/components/ui/AdminDashboard";
import AdminLeadPanel from "@/components/ui/AdminLeadPanel";
import AdminVehiclePanel from "@/components/ui/AdminVehiclePanel";
import AdminWAPanel from "@/components/ui/AdminWAPanel";
import LeadNotificationBar from "@/components/ui/LeadNotificationBar";
import { useAdminData } from "./useAdminData";
import type { AdminTab } from "../types";
import { brand } from "@/config/brand";

const AUTH_KEY = brand.adminAuthKey;

const NAV_ITEMS: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: "yonetim",
    label: "Araç Yönetimi",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
        <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
        <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: "talepler",
    label: "Araç Talepleri",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "wa",
    label: "WA Numaraları",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
];

interface AdminShellProps {
  onLogout: () => void;
}

export default function AdminShell({ onLogout }: AdminShellProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [leadFilter, setLeadFilter] = useState<"pending" | "today" | "overdue" | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    leads, loading, carCount, carCountLoading,
    whatsappClicksToday, whatsappClicksLoading,
    recentWhatsappClicks, recentClicksLoading, recentClicksError,
    weeklyClicks, weeklyClicksLoading,
    topCars, topCarsLoading,
    leadsByStatus, pendingCount, todayCount, overdueCount,
    sourceLabel, formatClickTime,
    handleLeadStatusChange, handleLeadNoteChange, handleLeadFollowUpChange,
    activeCarCount,
    weeklyVisitors, monthlyVisitors, visitorsLoading,
    topViewedCars, topViewedLoading,
  } = useAdminData(true);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    onLogout();
  };

  const currentLabel = NAV_ITEMS.find((n) => n.key === activeTab)?.label ?? "";

  return (
    <div className="flex min-h-screen bg-[#f4f5f7]">

      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-white/5 bg-[#0d1117]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-1 px-5 py-5 border-b border-white/5">
          <img src={brand.logos.horizontalDark} alt={brand.name} className="h-9 w-auto" />
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-400/70">Yönetim Paneli</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                <span className={active ? "text-amber-400" : "text-gray-500"}>{item.icon}</span>
                {item.label}
                {item.key === "talepler" && pendingCount > 0 && (
                  <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-amber-500/20 text-amber-300" : "bg-red-500/20 text-red-400"}`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Alt butonlar */}
        <div className="border-t border-white/5 px-3 py-3 space-y-1">
          <a
            href="/"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Vitrine Dön
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ── Mobil drawer overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-[#0d1117] shadow-2xl flex flex-col border-r border-white/5">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <img src={brand.logos.horizontalDark} alt={brand.name} className="h-8 w-auto" />
              <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 hover:bg-white/10">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const active = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      active ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                    }`}
                  >
                    <span className={active ? "text-amber-400" : "text-gray-500"}>{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-white/5 px-3 py-3 space-y-1">
              <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-white/5 hover:text-gray-300">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
                Vitrine Dön
              </a>
              <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400/70 hover:bg-red-500/10 hover:text-red-400">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Çıkış Yap
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Ana içerik ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">

        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Hamburger (mobil) */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
            >
              <svg className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <h1 className="text-sm font-bold text-[#111827]">{currentLabel}</h1>
              <p className="text-[11px] text-gray-400 hidden sm:block">{brand.name} Yönetim Paneli</p>
            </div>
          </div>

          {/* Sağ: bildirim sayıları */}
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("talepler")}
                className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                {pendingCount} bekliyor
              </button>
            )}
          </div>
        </header>

        {/* Sayfa içeriği */}
        <main className="flex-1 p-4 sm:p-6 space-y-4 overflow-x-hidden">
          {activeTab === "dashboard" && (
            <AdminDashboard
              weeklyClicks={weeklyClicks}
              weeklyClicksLoading={weeklyClicksLoading}
              topCars={topCars}
              topCarsLoading={topCarsLoading}
              recentWhatsappClicks={recentWhatsappClicks}
              recentClicksLoading={recentClicksLoading}
              recentClicksError={recentClicksError}
              whatsappClicksToday={whatsappClicksToday}
              whatsappClicksLoading={whatsappClicksLoading}
              carCount={carCount}
              carCountLoading={carCountLoading}
              activeCarCount={activeCarCount}
              pendingCount={pendingCount}
              loading={loading}
              sourceLabel={sourceLabel}
              formatClickTime={formatClickTime}
              weeklyVisitors={weeklyVisitors}
              monthlyVisitors={monthlyVisitors}
              visitorsLoading={visitorsLoading}
              topViewedCars={topViewedCars}
              topViewedLoading={topViewedLoading}
            />
          )}

          {activeTab === "yonetim" && <AdminVehiclePanel />}

          {activeTab === "talepler" && (
            loading ? (
              <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
                <div className="h-4 w-1/3 rounded bg-gray-200" />
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-1/2 rounded bg-gray-200" />
                    <div className="h-3 w-2/3 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <LeadNotificationBar
                  pendingCount={pendingCount}
                  todayCount={todayCount}
                  overdueCount={overdueCount}
                  onFilterChange={(f) => setLeadFilter((prev) => (prev === f ? null : f))}
                />
                <AdminLeadPanel
                  leads={leads}
                  onStatusChange={handleLeadStatusChange}
                  onNoteChange={handleLeadNoteChange}
                  onFollowUpChange={handleLeadFollowUpChange}
                  notificationFilter={leadFilter}
                  onClearNotificationFilter={() => setLeadFilter(null)}
                />
              </>
            )
          )}


{activeTab === "wa" && <AdminWAPanel />}
        </main>
      </div>
    </div>
  );
}
