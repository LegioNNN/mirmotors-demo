"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import AdminLeadPanel from "@/components/ui/AdminLeadPanel";
import AdminVehiclePanel from "@/components/ui/AdminVehiclePanel";
import LeadNotificationBar from "@/components/ui/LeadNotificationBar";
import type { LeadBuying, LeadStatus } from "@/types";

interface WhatsappClickRow {
  id: string;
  car_id: string;
  car_brand: string;
  car_model: string;
  car_year: number;
  car_price: number;
  source: string;
  phone_target: string;
  message: string;
  created_at: string;
}

const ADMIN_PASSWORD = "sancaktar2026";
const AUTH_KEY = "sancaktar_admin_auth";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [leads, setLeads] = useState<LeadBuying[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"talepler" | "yonetim">("talepler");
  const [leadFilter, setLeadFilter] = useState<"pending" | "today" | "overdue" | null>(null);
  const [carCount, setCarCount] = useState<number | null>(null);
  const [carCountLoading, setCarCountLoading] = useState(true);
  const [whatsappClicksToday, setWhatsappClicksToday] = useState<number | null>(null);
  const [whatsappClicksLoading, setWhatsappClicksLoading] = useState(true);
  const [recentWhatsappClicks, setRecentWhatsappClicks] = useState<WhatsappClickRow[]>([]);
  const [recentClicksLoading, setRecentClicksLoading] = useState(true);
  const [recentClicksError, setRecentClicksError] = useState<string | null>(null);

  /* --- Bildirim çubuğu hesaplamaları --- */
  const getTodayTr = () => {
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
  };

  const todayStart = () => {
    const d = getTodayTr();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const todayEnd = () => {
    const d = getTodayTr();
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const isOverdue = (followUpAt: string) => {
    const d = new Date(followUpAt);
    return d < todayStart();
  };

  const isTodayFollowUp = (followUpAt: string) => {
    const d = new Date(followUpAt);
    const start = todayStart();
    const end = todayEnd();
    return d >= start && d <= end;
  };

  const pendingCount = leads.filter((l) => l.status === "Bekliyor").length;
  const todayCount = leads.filter((l) => l.follow_up_at && isTodayFollowUp(l.follow_up_at)).length;
  const terminalStatuses: LeadStatus[] = ["Kabul Edildi", "Reddedildi", "Alım Yapıldı"];
  const overdueCount = leads.filter(
    (l) => l.follow_up_at && isOverdue(l.follow_up_at) && !terminalStatuses.includes(l.status)
  ).length;

  const sourceLabel = (source: string): string => {
    const labels: Record<string, string> = {
      car_card: "Vitrin Kartı",
      vehicle_detail_sidebar: "Detay Sayfası",
      vehicle_detail_mobile: "Mobil Detay",
    };
    return labels[source] ?? source;
  };

  const formatClickTime = (iso: string): string => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60_000);

    if (diffMin < 1) return "Az önce";
    if (diffMin < 60) return `${diffMin} dk önce`;

    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} sa önce`;

    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} gün önce`;

    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
  };

  const handleNotificationFilter = (filter: "pending" | "today" | "overdue") => {
    setLeadFilter((prev) => (prev === filter ? null : filter));
  };

  const goToTodayFollowUps = () => {
    setActiveTab("talepler");
    setLeadFilter("today");
  };

  /* Bugün dönüş yapılacak lead'ler (terminal olmayan, ilk 5) */
  const todayFollowUps = leads
    .filter(
      (l) =>
        l.follow_up_at &&
        isTodayFollowUp(l.follow_up_at) &&
        !terminalStatuses.includes(l.status)
    )
    .slice(0, 5);

  /* --- LocalStorage kontrolü --- */
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored === "true") {
      setAuthenticated(true);
    }
    setChecking(false);
  }, []);

  /* --- Supabase'den lead'leri çek (sadece authenticated) --- */
  useEffect(() => {
    if (!authenticated) return;

    async function fetchLeads() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("leads_buying")
        .select("*")
        .order("created_at", { ascending: false });

      if (!err) {
        setLeads((data as LeadBuying[]) ?? []);
      }
      setLoading(false);
    }
    fetchLeads();
  }, [authenticated]);

  /* --- Supabase'den araç sayısını çek --- */
  useEffect(() => {
    if (!authenticated) return;

    async function fetchCarCount() {
      setCarCountLoading(true);
      const { count, error: err } = await supabase
        .from("cars")
        .select("*", { count: "exact", head: true });

      if (!err && count !== null) {
        setCarCount(count);
      }
      setCarCountLoading(false);
    }
    fetchCarCount();
  }, [authenticated]);

  /* --- Bugünkü WhatsApp tıklamalarını çek --- */
  useEffect(() => {
    if (!authenticated) return;

    async function fetchWhatsappClicks() {
      setWhatsappClicksLoading(true);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const { count, error: err } = await supabase
        .from("whatsapp_clicks")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart.toISOString())
        .lte("created_at", todayEnd.toISOString());

      if (!err && count !== null) {
        setWhatsappClicksToday(count);
      }
      setWhatsappClicksLoading(false);
    }
    fetchWhatsappClicks();
  }, [authenticated]);

  /* --- Son 5 WhatsApp tıklamasını çek --- */
  useEffect(() => {
    if (!authenticated) return;

    async function fetchRecentClicks() {
      setRecentClicksLoading(true);
      setRecentClicksError(null);

      const { data, error: err } = await supabase
        .from("whatsapp_clicks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (err) {
        setRecentClicksError(err.message);
        setRecentWhatsappClicks([]);
      } else {
        setRecentWhatsappClicks((data as WhatsappClickRow[]) ?? []);
      }
      setRecentClicksLoading(false);
    }
    fetchRecentClicks();
  }, [authenticated]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, "true");
      setAuthenticated(true);
      setError("");
      setPassword("");
    } else {
      setError("Şifre hatalı.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
  };

  const handleLeadStatusChange = useCallback(
    (id: string, newStatus: LeadStatus) => {
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
      );
    },
    []
  );

  const handleLeadNoteChange = useCallback(
    (id: string, adminNote: string | null) => {
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, admin_note: adminNote } : l))
      );
    },
    []
  );

  const handleLeadFollowUpChange = useCallback(
    (id: string, followUpAt: string | null) => {
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, follow_up_at: followUpAt } : l))
      );
    },
    []
  );

  /* LocalStorage kontrol edilirken bekleme */
  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f9fafb]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />
      </main>
    );
  }

  /* --- Şifre ekranı --- */
  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#111827] to-[#1a2332] px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-gray-800 bg-white/5 p-8 backdrop-blur-sm">
            {/* Logo / Başlık */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-600 shadow-lg">
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
                  <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
                  <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <h1 className="text-lg font-black tracking-tight text-white">
                Sancaktar Yönetim
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                Devam etmek için şifre girin.
              </p>
            </div>

            {/* Şifre input */}
            <div className="space-y-3">
              <div>
                <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Şifre
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-700 bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  autoFocus
                />
              </div>

              {/* Hata mesajı */}
              {error && (
                <p className="text-xs font-medium text-red-400">{error}</p>
              )}

              {/* Giriş butonu */}
              <button
                type="button"
                onClick={handleLogin}
                disabled={!password.trim()}
                className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-700/20 transition-all duration-200 hover:bg-emerald-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
              >
                Giriş Yap
              </button>
            </div>
          </div>
          <p className="mt-4 text-center text-[11px] text-gray-600">
            Yetkisiz erişim yasaktır.
          </p>
        </div>
      </main>
    );
  }

  /* --- Admin Paneli (authenticated) --- */
  return (
    <main className="min-h-screen bg-[#f9fafb]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-black tracking-tight text-[#111827] sm:text-xl">
              Sancaktar Yönetim Paneli
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Araç alım taleplerini ve araç stokunu buradan yönetin.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50"
            >
              Çıkış Yap
            </button>
            <a
              href="/"
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              ← Vitrine Dön
            </a>
          </div>
        </div>
      </header>

      {/* Premium Dashboard Özet Kartları */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {/* Bekleyen Talepler */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Bekleyen Talepler</p>
                <p className="mt-1.5 text-2xl font-black text-[#111827]">
                  {loading ? (
                    <span className="text-gray-300">...</span>
                  ) : (
                    pendingCount
                  )}
                </p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                <svg className="h-4.5 w-4.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-gray-400">Henüz işlem bekleyen müşteri talepleri</p>
          </div>

          {/* Bugün Dönüş Yapılacak */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Bugün Dönüş Yapılacak</p>
                <p className="mt-1.5 text-2xl font-black text-amber-900">
                  {loading ? (
                    <span className="text-amber-400">...</span>
                  ) : (
                    todayCount
                  )}
                </p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <svg className="h-4.5 w-4.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-amber-600/80">Bugün dönüş yapılması gereken müşteriler</p>
          </div>

          {/* Geciken Takipler */}
          <div className={`rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${
            overdueCount > 0
              ? "border-red-300 bg-red-50"
              : "border-gray-200 bg-white"
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${
                  overdueCount > 0 ? "text-red-700" : "text-gray-400"
                }`}>Geciken Takipler</p>
                <p className={`mt-1.5 text-2xl font-black ${
                  overdueCount > 0 ? "text-red-900" : "text-[#111827]"
                }`}>
                  {loading ? (
                    <span className={overdueCount > 0 ? "text-red-300" : "text-gray-300"}>...</span>
                  ) : (
                    overdueCount
                  )}
                </p>
              </div>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                overdueCount > 0 ? "bg-red-100" : "bg-gray-100"
              }`}>
                <svg className={`h-4.5 w-4.5 ${
                  overdueCount > 0 ? "text-red-600" : "text-gray-400"
                }`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>
            <p className={`mt-2 text-[11px] ${
              overdueCount > 0 ? "text-red-500/80" : "text-gray-400"
            }`}>
              {overdueCount > 0
                ? "Zamanında dönüş yapılamayan gecikmiş müşteriler"
                : "Gecikmiş takip bulunmuyor"}
            </p>
          </div>

          {/* Stoktaki Araçlar */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Stoktaki Araçlar</p>
                <p className="mt-1.5 text-2xl font-black text-[#111827]">
                  {carCountLoading ? (
                    <span className="text-gray-300">...</span>
                  ) : (
                    carCount ?? 0
                  )}
                </p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <svg className="h-4.5 w-4.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
                  <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
                  <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-gray-400">Stokta bulunan toplam araç sayısı</p>
          </div>

          {/* Bugünkü WhatsApp Tıklamaları */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">WhatsApp Tıklamaları</p>
                <p className="mt-1.5 text-2xl font-black text-[#111827]">
                  {whatsappClicksLoading ? (
                    <span className="text-gray-300">...</span>
                  ) : (
                    whatsappClicksToday ?? 0
                  )}
                </p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50">
                <svg className="h-4.5 w-4.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-gray-400">Bugünkü WhatsApp tıklama sayısı</p>
          </div>
        </div>
      </div>

      {/* Son WhatsApp Tıklamaları */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c 0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <h2 className="text-sm font-bold text-[#111827]">Son WhatsApp Tıklamaları</h2>
          </div>

          {recentClicksError ? (
            <p className="text-xs text-red-500">Veri yüklenemedi: {recentClicksError}</p>
          ) : recentClicksLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
                  <div className="h-4 w-1/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/6 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : recentWhatsappClicks.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-gray-400">
              <svg className="h-10 w-10 text-gray-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Henüz WhatsApp hareketi yok.</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  Müşteriler araçlardan WhatsApp&rsquo;a tıkladıkça burada görünecek.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentWhatsappClicks.map((click) => (
                <div key={click.id} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#111827] truncate">
                      {click.car_brand} {click.car_model} {click.car_year}
                    </p>
                    <p className="text-[11px] text-gray-400">{sourceLabel(click.source)}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-gray-400">{formatClickTime(click.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bugün Dönüş Yapılacaklar */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <h2 className="text-sm font-bold text-[#111827]">Bugün Dönüş Yapılacaklar</h2>
            </div>
            <button
              type="button"
              onClick={goToTodayFollowUps}
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700 transition-all hover:bg-amber-100 hover:shadow-sm"
            >
              Tümünü Gör
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-4 w-1/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/5 rounded bg-gray-200" />
                  <div className="h-4 w-1/6 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : todayFollowUps.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-gray-400">
              <svg className="h-10 w-10 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Bugün planlı dönüş bulunmuyor.</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  Tekrar dönüş tarihi verilen talepler burada listelenir.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-amber-100">
              {todayFollowUps.map((lead) => {
                const followUpDate = lead.follow_up_at ? new Date(lead.follow_up_at) : null;
                const followUpHour = followUpDate
                  ? followUpDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
                  : "";
                return (
                  <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#111827] truncate">{lead.customer_name}</p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {lead.phone} &middot; {lead.brand} {lead.model} {lead.year}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] font-medium text-amber-700 bg-amber-50 rounded-md px-2 py-0.5 self-start sm:self-auto">
                      {followUpHour}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sekmeler */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("talepler")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-bold transition-all ${
              activeTab === "talepler"
                ? "bg-[#111827] text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            Araç Talepleri
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("yonetim")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-bold transition-all ${
              activeTab === "yonetim"
                ? "bg-[#111827] text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            Araç Yönetimi
          </button>
        </div>
      </div>

      {/* Icerik */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === "talepler" ? (
          loading ? (
            <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 h-4 w-1/3 rounded bg-gray-200" />
              {[1, 2].map((i) => (
                <div key={i} className="mb-4 space-y-2">
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
                onFilterChange={handleNotificationFilter}
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
        ) : (
          <AdminVehiclePanel />
        )}
      </section>
    </main>
  );
}
