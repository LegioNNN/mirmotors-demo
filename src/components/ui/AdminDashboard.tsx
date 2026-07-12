"use client";

import { useEffect, useState } from "react";
import { getOnlineUserCount, getTodayVisitors } from "@/utils/visitorTrack";

interface Props {
  weeklyClicks: { day: string; count: number }[];
  weeklyClicksLoading: boolean;
  topCars: { brand: string; model: string; year: number; count: number }[];
  topCarsLoading: boolean;
  recentWhatsappClicks: { id: string; car_brand: string; car_model: string; car_year: number; source: string; created_at: string }[];
  recentClicksLoading: boolean;
  recentClicksError: string | null;
  whatsappClicksToday: number | null;
  whatsappClicksLoading: boolean;
  carCount: number | null;
  carCountLoading: boolean;
  activeCarCount: number | null;
  pendingCount: number;
  loading: boolean;
  sourceLabel: (s: string) => string;
  formatClickTime: (iso: string) => string;
  weeklyVisitors: { day: string; count: number }[];
  monthlyVisitors: { week: string; count: number }[];
  visitorsLoading: boolean;
  topViewedCars: { car_id: string; brand: string; model: string; year: number; count: number }[];
  topViewedLoading: boolean;
  staleCarCount: number;
  soldThisMonth: number;
  onNavigate: (tab: "dashboard" | "yonetim" | "talepler" | "wa") => void;
}

function MiniBar({ data, keyName, color, loading }: {
  data: { count: number; [k: string]: string | number }[];
  keyName: string;
  color: string;
  loading: boolean;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  if (loading) return (
    <div className="flex h-20 items-end gap-1 animate-pulse">
      {[50, 70, 40, 90, 60, 80, 55].map((h, i) => (
        <div key={i} className="flex-1 rounded-t bg-gray-100" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
  const BAR_MAX_PX = 56;
  return (
    <div className="flex items-end gap-1" style={{ height: 80 }}>
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        const barPx = Math.max(Math.round((d.count / max) * BAR_MAX_PX), d.count > 0 ? 4 : 1);
        return (
          <div key={i} className="group flex flex-1 flex-col items-center gap-0.5">
            <span className="text-[9px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity leading-none">{d.count}</span>
            <div className="flex w-full flex-1 items-end">
              <div
                className={`w-full rounded-t transition-all duration-700 ${isLast ? "bg-amber-400" : "bg-gray-200 group-hover:opacity-80"}`}
                style={{ height: barPx }}
              />
            </div>
            <span className={`text-[9px] font-semibold leading-none ${isLast ? "text-emerald-600" : "text-gray-400"}`}>
              {d[keyName] as string}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function VisitorChart({ weeklyVisitors, monthlyVisitors, loading }: {
  weeklyVisitors: { day: string; count: number }[];
  monthlyVisitors: { week: string; count: number }[];
  loading: boolean;
}) {
  const [range, setRange] = useState<"7gun" | "4hafta">("7gun");
  const data = range === "7gun" ? weeklyVisitors : monthlyVisitors;
  const keyName = range === "7gun" ? "day" : "week";
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-[#111827]">Vitrini Gezenler</h2>
          <p className="text-xs text-gray-400">Araçlarına bakan potansiyel müşteri</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-[#111827]">
            {loading ? "—" : total}
            <span className="ml-1 text-xs font-normal text-gray-400">ziyaret</span>
          </span>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(["7gun", "4hafta"] as const).map((r) => (
              <button key={r} type="button" onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${range === r ? "bg-[#111827] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                {r === "7gun" ? "7 Gün" : "4 Hafta"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <MiniBar data={data} keyName={keyName} color="bg-blue-500" loading={loading} />
    </div>
  );
}

export default function AdminDashboard({
  weeklyClicks, weeklyClicksLoading,
  topCars, topCarsLoading,
  recentWhatsappClicks, recentClicksLoading, recentClicksError,
  whatsappClicksToday, whatsappClicksLoading,
  carCount, carCountLoading, activeCarCount,
  pendingCount, loading,
  sourceLabel, formatClickTime,
  weeklyVisitors, monthlyVisitors, visitorsLoading,
  topViewedCars, topViewedLoading,
  staleCarCount, soldThisMonth, onNavigate,
}: Props) {
  const [online, setOnline] = useState(0);
  const [todayV, setTodayV] = useState(0);
  const [liveLoading, setLiveLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLiveLoading(true);
      const [o, v] = await Promise.all([getOnlineUserCount(), getTodayVisitors()]);
      setOnline(o); setTodayV(v);
      setLiveLoading(false);
    }
    load();
    const t = setInterval(async () => {
      const [o, v] = await Promise.all([getOnlineUserCount(), getTodayVisitors()]);
      setOnline(o); setTodayV(v);
    }, 30_000);
    return () => clearInterval(t);
  }, []);

  const wpTotal7 = weeklyClicks.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-5">

      {/* ── Hızlı İşlemler ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Hızlı İşlemler</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onNavigate("yonetim")}
            className="flex items-center gap-2 rounded-xl bg-[#111827] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-gray-800 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Yeni Araç Ekle
          </button>
          <button
            type="button"
            onClick={() => onNavigate("talepler")}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <svg className="h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Araç Alım Taleplerine Bak
            {pendingCount > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white">{pendingCount}</span>
            )}
          </button>
          {staleCarCount > 0 && (
            <button
              type="button"
              onClick={() => onNavigate("yonetim")}
              className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-bold text-orange-700 shadow-sm hover:bg-orange-100 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {staleCarCount} araç 30+ gün bekliyor
            </button>
          )}
        </div>
      </div>

      {/* ── 6 Stat Kartı (2 satır) ── */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">Genel Bakış</p>
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

          {/* Bekleyen Talepler */}
          <div className={`col-span-1 rounded-xl border p-4 shadow-sm transition-colors ${
            !loading && pendingCount > 0 ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white"
          }`}>
            <div className="flex items-start justify-between">
              <p className={`text-[10px] font-bold uppercase tracking-wider leading-tight ${
                !loading && pendingCount > 0 ? "text-amber-600" : "text-gray-400"
              }`}>Yanıt Bekleyen</p>
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                !loading && pendingCount > 0 ? "bg-amber-100" : "bg-gray-100"
              }`}>
                <svg className={`h-3.5 w-3.5 ${!loading && pendingCount > 0 ? "text-amber-600" : "text-gray-400"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
            </div>
            <p className={`mt-2 text-3xl font-black ${!loading && pendingCount > 0 ? "text-amber-700" : "text-[#111827]"}`}>
              {loading ? <span className="text-gray-200">—</span> : pendingCount}
            </p>
            <p className={`mt-1 text-[10px] ${!loading && pendingCount > 0 ? "font-semibold text-amber-600" : "text-gray-400"}`}>
              {!loading && pendingCount > 0 ? "Dönüş bekliyor" : "Tümü yanıtlandı"}
            </p>
          </div>

          {/* Vitrindeki Araç */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider leading-tight text-gray-400">Vitrindeki Araç</p>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <svg className="h-3.5 w-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="1" y="3" width="15" height="13" rx="2"/><path d="m16 8 5 3v5h-5V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
            </div>
            <p className="mt-2 text-3xl font-black text-[#111827]">
              {carCountLoading ? <span className="text-gray-200">—</span> : activeCarCount ?? 0}
              {!carCountLoading && carCount && (
                <span className="ml-1 text-base font-normal text-gray-400">/{carCount}</span>
              )}
            </p>
            <p className="mt-1 text-[10px] text-gray-400">Satışa hazır stok</p>
          </div>

          {/* Bugünkü WA */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider leading-tight text-gray-400">Bugün WA</p>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-50">
                <svg className="h-3.5 w-3.5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
              </div>
            </div>
            <p className="mt-2 text-3xl font-black text-[#111827]">
              {whatsappClicksLoading ? <span className="text-gray-200">—</span> : whatsappClicksToday ?? 0}
            </p>
            <p className="mt-1 text-[10px] text-gray-400">Sıcak müşteri</p>
          </div>

          {/* Şu An Vitrinde — CANLI */}
          <div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 shadow-sm">
            <div className="absolute right-3 top-3 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-50" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider leading-tight text-emerald-100">Şu An Canlı</p>
            <p className="mt-2 text-3xl font-black text-white">
              {liveLoading ? <span className="text-emerald-300">—</span> : online}
            </p>
            <p className="mt-1 text-[10px] text-emerald-200">
              Bugün {liveLoading ? "—" : todayV} ziyaret
            </p>
          </div>

          {/* 30+ gün bekleyen */}
          <div className={`rounded-xl border p-4 shadow-sm ${staleCarCount > 0 ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-white"}`}>
            <div className="flex items-start justify-between">
              <p className={`text-[10px] font-bold uppercase tracking-wider leading-tight ${staleCarCount > 0 ? "text-orange-600" : "text-gray-400"}`}>30+ Gün Bekleyen</p>
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${staleCarCount > 0 ? "bg-orange-100" : "bg-gray-100"}`}>
                <svg className={`h-3.5 w-3.5 ${staleCarCount > 0 ? "text-orange-600" : "text-gray-400"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
            </div>
            <p className={`mt-2 text-3xl font-black ${staleCarCount > 0 ? "text-orange-700" : "text-[#111827]"}`}>{staleCarCount}</p>
            <p className={`mt-1 text-[10px] ${staleCarCount > 0 ? "font-semibold text-orange-600" : "text-gray-400"}`}>
              {staleCarCount > 0 ? "Fiyat gözden geçir" : "Araçlar taze"}
            </p>
          </div>

          {/* Bu ay satılan */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider leading-tight text-emerald-600">Bu Ay Satılan</p>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                <svg className="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>
            <p className="mt-2 text-3xl font-black text-emerald-700">{soldThisMonth}</p>
            <p className="mt-1 text-[10px] text-emerald-600">Araç satışa kapandı</p>
          </div>

        </div>
      </div>

      {/* ── Ziyaretçi Grafiği (seçmeli) ── */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">Vitrin Trafiği</p>
      <VisitorChart
        weeklyVisitors={weeklyVisitors}
        monthlyVisitors={monthlyVisitors}
        loading={visitorsLoading}
      />
      </div>

      {/* ── WhatsApp + En Çok Sorulan / Bakılan ── */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">Müşteri İlgisi</p>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* WA 7 gün */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#111827]">Müşteri İletişimi — 7 Gün</h2>
              <p className="text-xs text-gray-400">WhatsApp'tan ulaşan müşteri</p>
            </div>
            <span className="text-sm font-black text-emerald-700">
              {weeklyClicksLoading ? "—" : wpTotal7}
            </span>
          </div>
          <MiniBar data={weeklyClicks} keyName="day" color="bg-emerald-500" loading={weeklyClicksLoading} />
        </div>

        {/* En çok sorulan (WA) */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-[#111827]">En Çok İlgi Gören Araç</h2>
          {topCarsLoading ? (
            <div className="space-y-2 animate-pulse">{[1,2,3].map(i=><div key={i} className="h-4 rounded bg-gray-100"/>)}</div>
          ) : topCars.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">Veri yok</p>
          ) : (
            <div className="space-y-2.5">
              {topCars.map((car, i) => {
                const pct = Math.round((car.count / topCars[0].count) * 100);
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 text-sm shrink-0">{["🥇","🥈","🥉","4.","5."][i]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="truncate text-[11px] font-bold text-[#111827]">{car.brand} {car.model} {car.year}</span>
                        <span className="ml-1 shrink-0 text-[11px] font-black text-emerald-700">{car.count}x</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* En çok bakılan (page_views) */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-[#111827]">En Çok Bakılan Araç</h2>
          {topViewedLoading ? (
            <div className="space-y-2 animate-pulse">{[1,2,3].map(i=><div key={i} className="h-4 rounded bg-gray-100"/>)}</div>
          ) : topViewedCars.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">Veri yok</p>
          ) : (
            <div className="space-y-2.5">
              {topViewedCars.map((car, i) => {
                const pct = Math.round((car.count / topViewedCars[0].count) * 100);
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 text-sm shrink-0">{["🥇","🥈","🥉","4.","5."][i]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="truncate text-[11px] font-bold text-[#111827]">{car.brand} {car.model} {car.year}</span>
                        <span className="ml-1 shrink-0 text-[11px] font-black text-blue-700">{car.count}x</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-blue-400" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      </div>

      {/* ── Son WA Tıklamalar ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-[#111827]">Son Sıcak Müşteriler</h2>
        {recentClicksError ? (
          <p className="text-xs text-red-500">Yüklenemedi</p>
        ) : recentClicksLoading ? (
          <div className="space-y-2 animate-pulse">{[1,2,3].map(i=><div key={i} className="flex gap-3"><div className="flex-1 h-4 rounded bg-gray-100"/><div className="h-4 w-16 rounded bg-gray-100"/></div>)}</div>
        ) : recentWhatsappClicks.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">Henüz müşteri ilgisi yok</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentWhatsappClicks.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#111827]">{c.car_brand} {c.car_model} {c.car_year}</p>
                  <p className="text-[11px] text-gray-400">{sourceLabel(c.source)}</p>
                </div>
                <span className="shrink-0 text-[11px] text-gray-400">{formatClickTime(c.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
