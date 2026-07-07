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
                className={`w-full rounded-t transition-all duration-700 ${isLast ? color : "bg-gray-200 group-hover:opacity-80"}`}
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
    <div className="space-y-4">

      {/* ── 4 Ana Stat Kartı ── */}
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

        {/* Bekleyen Talepler — fırsat, 0'dan büyükse uyarı */}
        <div className={`rounded-xl border p-4 shadow-sm transition-colors ${
          !loading && pendingCount > 0
            ? "border-blue-300 bg-blue-50"
            : "border-gray-200 bg-white"
        }`}>
          <p className={`text-[11px] font-bold uppercase tracking-wider ${
            !loading && pendingCount > 0 ? "text-blue-600" : "text-gray-400"
          }`}>Değerlendirilecek Fırsat</p>
          <p className={`mt-2 text-3xl font-black ${
            !loading && pendingCount > 0 ? "text-blue-700" : "text-[#111827]"
          }`}>
            {loading ? <span className="text-gray-200">—</span> : pendingCount}
          </p>
          <p className={`mt-1 text-[11px] ${
            !loading && pendingCount > 0 ? "font-semibold text-blue-600" : "text-gray-400"
          }`}>
            {!loading && pendingCount > 0 ? "Dönüş bekleyen müşteri" : "Tümü değerlendirildi"}
          </p>
        </div>

        {/* Satıştaki Araç */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Vitrindeki Araç</p>
          <p className="mt-2 text-3xl font-black text-[#111827]">
            {carCountLoading ? <span className="text-gray-200">—</span> : activeCarCount ?? 0}
            {!carCountLoading && carCount && (
              <span className="ml-1.5 text-base font-normal text-gray-400">/ {carCount}</span>
            )}
          </p>
          <p className="mt-1 text-[11px] text-gray-400">Satışa hazır stok</p>
        </div>

        {/* Bugünkü Sıcak Müşteri */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Bugünkü Sıcak Müşteri</p>
          <p className="mt-2 text-3xl font-black text-[#111827]">
            {whatsappClicksLoading ? <span className="text-gray-200">—</span> : whatsappClicksToday ?? 0}
          </p>
          <p className="mt-1 text-[11px] text-gray-400">WhatsApp'tan ulaştı</p>
        </div>

        {/* Şu An Vitrinde — CANLI */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 shadow-sm">
          {/* Canlı pulse arka plan */}
          <div className="absolute right-3 top-3 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-50" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">Şu An Vitrinde</p>
          <p className="mt-2 text-3xl font-black text-white">
            {liveLoading ? <span className="text-emerald-300">—</span> : online}
          </p>
          <p className="mt-1 text-[11px] text-emerald-200">
            Bugün {liveLoading ? "—" : todayV} kişi araçlara baktı
          </p>
        </div>
      </div>

      {/* ── Ziyaretçi Grafiği (seçmeli) ── */}
      <VisitorChart
        weeklyVisitors={weeklyVisitors}
        monthlyVisitors={monthlyVisitors}
        loading={visitorsLoading}
      />

      {/* ── WhatsApp + En Çok Sorulan / Bakılan ── */}
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
