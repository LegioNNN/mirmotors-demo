"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { startHeartbeat, trackPageView } from "@/utils/visitorTrack";
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

export function useAdminData(authenticated: boolean) {
  const [leads, setLeads] = useState<LeadBuying[]>([]);
  const [loading, setLoading] = useState(true);
  const [carCount, setCarCount] = useState<number | null>(null);
  const [carCountLoading, setCarCountLoading] = useState(true);
  const [whatsappClicksToday, setWhatsappClicksToday] = useState<number | null>(null);
  const [whatsappClicksLoading, setWhatsappClicksLoading] = useState(true);
  const [recentWhatsappClicks, setRecentWhatsappClicks] = useState<WhatsappClickRow[]>([]);
  const [recentClicksLoading, setRecentClicksLoading] = useState(true);
  const [recentClicksError, setRecentClicksError] = useState<string | null>(null);
  const [weeklyClicks, setWeeklyClicks] = useState<{ day: string; count: number }[]>([]);
  const [weeklyClicksLoading, setWeeklyClicksLoading] = useState(true);
  const [topCars, setTopCars] = useState<{ brand: string; model: string; year: number; count: number }[]>([]);
  const [topCarsLoading, setTopCarsLoading] = useState(true);
  const [leadsByStatus, setLeadsByStatus] = useState<{ status: string; count: number; color: string }[]>([]);
  const [activeCarCount, setActiveCarCount] = useState<number | null>(null);
  const [weeklyVisitors, setWeeklyVisitors] = useState<{ day: string; count: number }[]>([]);
  const [monthlyVisitors, setMonthlyVisitors] = useState<{ week: string; count: number }[]>([]);
  const [visitorsLoading, setVisitorsLoading] = useState(true);
  const [topViewedCars, setTopViewedCars] = useState<{ car_id: string; brand: string; model: string; year: number; count: number }[]>([]);
  const [topViewedLoading, setTopViewedLoading] = useState(true);

  /* --- Tarih yardımcıları --- */
  const getTodayTr = useCallback(() => {
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
  }, []);

  const todayStart = useCallback(() => {
    const d = getTodayTr();
    d.setHours(0, 0, 0, 0);
    return d;
  }, [getTodayTr]);

  const todayEnd = useCallback(() => {
    const d = getTodayTr();
    d.setHours(23, 59, 59, 999);
    return d;
  }, [getTodayTr]);

  const isOverdue = useCallback(
    (followUpAt: string) => {
      const d = new Date(followUpAt);
      return d < todayStart();
    },
    [todayStart]
  );

  const isTodayFollowUp = useCallback(
    (followUpAt: string) => {
      const d = new Date(followUpAt);
      const start = todayStart();
      const end = todayEnd();
      return d >= start && d <= end;
    },
    [todayStart, todayEnd]
  );

  const terminalStatuses: LeadStatus[] = ["Kabul Edildi", "Reddedildi", "Alım Yapıldı"];

  const pendingCount = leads.filter((l) => l.status === "Bekliyor").length;
  const todayCount = leads.filter((l) => l.follow_up_at && isTodayFollowUp(l.follow_up_at)).length;
  const overdueCount = leads.filter(
    (l) => l.follow_up_at && isOverdue(l.follow_up_at) && !terminalStatuses.includes(l.status)
  ).length;

  /* --- Statü bazında lead sayıları --- */
  const countByStatus: Record<string, number> = useMemo(() => {
    const statuses = ["Bekliyor", "Arandı", "Ulaşılamadı", "Tekrar Aranacak", "Kabul Edildi", "Reddedildi", "Alım Yapıldı"];
    return Object.fromEntries(statuses.map((s) => [s, leads.filter((l) => l.status === s).length]));
  }, [leads]);

  /* --- Yardımcı fonksiyonlar --- */
  const sourceLabel = useCallback((source: string): string => {
    const labels: Record<string, string> = {
      car_card: "Vitrin Kartı",
      vehicle_detail_sidebar: "Detay Sayfası",
      vehicle_detail_mobile: "Mobil Detay",
    };
    return labels[source] ?? source;
  }, []);

  const formatClickTime = useCallback((iso: string): string => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60_000);

    if (diffMin < 1) return "Az önce";
    if (diffMin < 60) return `${diffMin} dk önce`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)} sa önce`;
    if (diffMin < 10080) return `${Math.floor(diffMin / 1440)} gün önce`;

    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
  }, []);

  /* --- Supabase'den lead'leri çek --- */
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

  /* --- Heartbeat & sayfa görüntüleme --- */
  useEffect(() => {
    if (!authenticated) return;
    startHeartbeat("/admin");
    trackPageView({ path: "/admin", referrer: document.referrer });
  }, [authenticated]);

  /* --- Araç sayısı --- */
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

  /* --- Bugünkü WhatsApp tıklamaları --- */
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

  /* --- Son 5 WhatsApp tıklaması --- */
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

  /* --- Son 7 günlük WhatsApp tıklamaları --- */
  useEffect(() => {
    if (!authenticated) return;
    async function fetchWeeklyClicks() {
      setWeeklyClicksLoading(true);
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
      });
      const results = await Promise.all(
        days.map(async (d) => {
          const start = new Date(d);
          start.setHours(0, 0, 0, 0);
          const end = new Date(d);
          end.setHours(23, 59, 59, 999);
          const { count } = await supabase
            .from("whatsapp_clicks")
            .select("*", { count: "exact", head: true })
            .gte("created_at", start.toISOString())
            .lte("created_at", end.toISOString());
          const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
          return { day: dayNames[d.getDay()], count: count ?? 0 };
        })
      );
      setWeeklyClicks(results);
      setWeeklyClicksLoading(false);
    }
    fetchWeeklyClicks();
  }, [authenticated]);

  /* --- En çok sorulan 5 araç --- */
  useEffect(() => {
    if (!authenticated) return;
    async function fetchTopCars() {
      setTopCarsLoading(true);
      const { data } = await supabase
        .from("whatsapp_clicks")
        .select("car_brand, car_model, car_year")
        .order("created_at", { ascending: false })
        .limit(200);
      if (data) {
        const counts: Record<string, { brand: string; model: string; year: number; count: number }> = {};
        data.forEach((row: { car_brand: string; car_model: string; car_year: number }) => {
          const key = `${row.car_brand} ${row.car_model} ${row.car_year}`;
          if (!counts[key]) counts[key] = { brand: row.car_brand, model: row.car_model, year: row.car_year, count: 0 };
          counts[key].count++;
        });
        const sorted = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
        setTopCars(sorted);
      }
      setTopCarsLoading(false);
    }
    fetchTopCars();
  }, [authenticated]);

  /* --- Aktif araç sayısı --- */
  useEffect(() => {
    if (!authenticated) return;
    supabase.from("cars").select("*", { count: "exact", head: true }).eq("status", "Aktif").then(({ count }) => {
      if (count !== null) setActiveCarCount(count);
    });
  }, [authenticated]);

  /* --- Haftalık & aylık ziyaretçi --- */
  useEffect(() => {
    if (!authenticated) return;
    async function fetchVisitors() {
      setVisitorsLoading(true);
      const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
      // Son 7 gün
      const weekly = await Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const start = new Date(d); start.setHours(0, 0, 0, 0);
          const end = new Date(d); end.setHours(23, 59, 59, 999);
          return supabase.from("page_views").select("*", { count: "exact", head: true })
            .gte("created_at", start.toISOString()).lte("created_at", end.toISOString())
            .then(({ count }) => ({ day: dayNames[d.getDay()], count: count ?? 0 }));
        })
      );
      setWeeklyVisitors(weekly);
      // Son 4 hafta
      const monthly = await Promise.all(
        Array.from({ length: 4 }, (_, i) => {
          const start = new Date(); start.setDate(start.getDate() - (3 - i) * 7 - 6); start.setHours(0, 0, 0, 0);
          const end = new Date(); end.setDate(end.getDate() - (3 - i) * 7); end.setHours(23, 59, 59, 999);
          const label = `H${i + 1}`;
          return supabase.from("page_views").select("*", { count: "exact", head: true })
            .gte("created_at", start.toISOString()).lte("created_at", end.toISOString())
            .then(({ count }) => ({ week: label, count: count ?? 0 }));
        })
      );
      setMonthlyVisitors(monthly);
      setVisitorsLoading(false);
    }
    fetchVisitors();
  }, [authenticated]);

  /* --- En çok bakılan araçlar (page_views) --- */
  useEffect(() => {
    if (!authenticated) return;
    async function fetchTopViewed() {
      setTopViewedLoading(true);
      const { data } = await supabase.from("page_views").select("path").ilike("path", "/ilan/%").limit(500);
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((r: { path: string }) => {
          const id = r.path.replace("/ilan/", "").split("/")[0];
          if (id) counts[id] = (counts[id] ?? 0) + 1;
        });
        const topIds = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        if (topIds.length === 0) { setTopViewedCars([]); setTopViewedLoading(false); return; }
        const ids = topIds.map(([id]) => id);
        const { data: cars } = await supabase.from("cars").select("id, brand, model, year").in("id", ids);
        if (cars) {
          const result = topIds.map(([id, count]) => {
            const car = (cars as { id: string; brand: string; model: string; year: number }[]).find((c) => c.id === id);
            return car ? { car_id: id, brand: car.brand, model: car.model, year: car.year, count } : null;
          }).filter(Boolean) as { car_id: string; brand: string; model: string; year: number; count: number }[];
          setTopViewedCars(result);
        }
      }
      setTopViewedLoading(false);
    }
    fetchTopViewed();
  }, [authenticated]);

  /* --- Lead durum dağılımı --- */
  useEffect(() => {
    if (leads.length === 0) return;
    const statusColors: Record<string, string> = {
      Bekliyor: "#f59e0b",
      Arandı: "#3b82f6",
      Ulaşılamadı: "#ef4444",
      "Tekrar Aranacak": "#8b5cf6",
      "Kabul Edildi": "#10b981",
      Reddedildi: "#6b7280",
      "Alım Yapıldı": "#059669",
    };
    const counts = Object.entries(countByStatus)
      .filter(([s]) => s !== "Tümü")
      .map(([status, count]) => ({ status, count, color: statusColors[status] ?? "#9ca3af" }))
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.count - a.count);
    setLeadsByStatus(counts);
  }, [leads, countByStatus]);

  /* --- Callback'ler --- */
  const handleLeadStatusChange = useCallback((id: string, newStatus: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
  }, []);

  const handleLeadNoteChange = useCallback((id: string, adminNote: string | null) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, admin_note: adminNote } : l)));
  }, []);

  const handleLeadFollowUpChange = useCallback((id: string, followUpAt: string | null) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, follow_up_at: followUpAt } : l)));
  }, []);

  return {
    leads,
    loading,
    carCount,
    carCountLoading,
    whatsappClicksToday,
    whatsappClicksLoading,
    recentWhatsappClicks,
    recentClicksLoading,
    recentClicksError,
    weeklyClicks,
    weeklyClicksLoading,
    topCars,
    topCarsLoading,
    leadsByStatus,
    pendingCount,
    todayCount,
    overdueCount,
    sourceLabel,
    formatClickTime,
    handleLeadStatusChange,
    handleLeadNoteChange,
    handleLeadFollowUpChange,
    activeCarCount,
    weeklyVisitors,
    monthlyVisitors,
    visitorsLoading,
    topViewedCars,
    topViewedLoading,
  };
}
