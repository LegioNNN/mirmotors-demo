"use client";

import { useState } from "react";
import type { LeadBuying } from "@/types";

interface AdminFollowUpsProps {
  leads: LeadBuying[];
  loading: boolean;
  onStatusChange: (id: string, newStatus: LeadBuying["status"]) => void;
  onNoteChange: (id: string, adminNote: string | null) => void;
  onFollowUpChange: (id: string, followUpAt: string | null) => void;
}

export default function AdminFollowUps({
  leads,
  loading,
  onStatusChange,
  onNoteChange,
  onFollowUpChange,
}: AdminFollowUpsProps) {
  /* --- Tarih yardımcıları (admin sayfasındakiyle aynı mantık) --- */
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

  const terminalStatuses: LeadBuying["status"][] = ["Kabul Edildi", "Reddedildi", "Alım Yapıldı"];

  /* Filtreleme state */
  const [filter, setFilter] = useState<"all" | "pending" | "today" | "overdue">("all");

  const filtered = leads.filter((l) => {
    if (filter === "pending") return l.status === "Bekliyor";
    if (filter === "today") return l.follow_up_at && isTodayFollowUp(l.follow_up_at) && !terminalStatuses.includes(l.status);
    if (filter === "overdue") return l.follow_up_at && isOverdue(l.follow_up_at) && !terminalStatuses.includes(l.status);
    return true;
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);

  /**
   * label renkleri
   */
  const statusColors: Record<string, string> = {
    "Bekliyor": "bg-blue-100 text-blue-800",
    "Arandı": "bg-blue-100 text-blue-800",
    "Ulaşılamadı": "bg-red-100 text-red-800",
    "Tekrar Aranacak": "bg-purple-100 text-purple-800",
    "Kabul Edildi": "bg-green-100 text-green-800",
    "Reddedildi": "bg-gray-100 text-gray-600",
    "Alım Yapıldı": "bg-emerald-100 text-emerald-800",
  };

  return (
    <div className="space-y-6">
      {/* Filtre Butonları */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
            filter === "all"
              ? "bg-[#111827] text-white shadow-sm"
              : "border border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
        >
          Tümü ({leads.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("pending")}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
            filter === "pending"
              ? "bg-blue-600 text-white shadow-sm"
              : "border border-blue-200 text-blue-700 hover:bg-blue-50"
          }`}
        >
          Bekleyen ({leads.filter(l => l.status === "Bekliyor").length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("today")}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
            filter === "today"
              ? "bg-blue-700 text-white shadow-sm"
              : "border border-blue-300 text-blue-800 hover:bg-blue-50"
          }`}
        >
          Bugün Dönüş ({leads.filter(l => l.follow_up_at && isTodayFollowUp(l.follow_up_at) && !terminalStatuses.includes(l.status)).length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("overdue")}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
            filter === "overdue"
              ? "bg-red-600 text-white shadow-sm"
              : "border border-red-200 text-red-700 hover:bg-red-50"
          }`}
        >
          Geciken ({leads.filter(l => l.follow_up_at && isOverdue(l.follow_up_at) && !terminalStatuses.includes(l.status)).length})
        </button>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="h-4 w-1/3 rounded bg-gray-200 mb-2" />
              <div className="h-3 w-2/3 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
          <svg className="h-12 w-12 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          <p className="text-sm font-medium text-gray-500">Bu filtrede takip bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => {
            const isExpanded = expandedId === lead.id;
            const followUpDate = lead.follow_up_at ? new Date(lead.follow_up_at) : null;
            const followUpStr = followUpDate
              ? followUpDate.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
              : "";

            return (
              <div
                key={lead.id}
                className={`rounded-xl border bg-white p-4 shadow-sm transition-all ${
                  lead.follow_up_at && isOverdue(lead.follow_up_at) && !terminalStatuses.includes(lead.status)
                    ? "border-red-200"
                    : lead.follow_up_at && isTodayFollowUp(lead.follow_up_at) && !terminalStatuses.includes(lead.status)
                    ? "border-blue-200"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-[#111827]">{lead.customer_name}</h3>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${statusColors[lead.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {lead.status}
                      </span>
                      {lead.follow_up_at && isOverdue(lead.follow_up_at) && !terminalStatuses.includes(lead.status) && (
                        <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                          Gecikmiş
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {lead.phone} &middot; {lead.brand} {lead.model} {lead.year}
                    </p>
                    {followUpStr && (
                      <p className="mt-0.5 text-[11px] font-medium text-blue-700">
                        📅 Takip: {followUpStr}
                      </p>
                    )}
                    {lead.admin_note && (
                      <p className="mt-0.5 text-[11px] text-gray-400 italic line-clamp-1">{lead.admin_note}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                    className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-500 transition-colors hover:bg-gray-50"
                  >
                    {isExpanded ? "Gizle" : "Detay"}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                    {/* Not */}
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">Yönetici Notu</label>
                      <textarea
                        rows={2}
                        defaultValue={lead.admin_note ?? ""}
                        onBlur={(e) => {
                          const val = e.target.value.trim() || null;
                          if (val !== lead.admin_note) onNoteChange(lead.id, val);
                        }}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="Not ekleyin..."
                      />
                    </div>

                    {/* Durum */}
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">Durum</label>
                      <select
                        defaultValue={lead.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as LeadBuying["status"];
                          onStatusChange(lead.id, newStatus);
                        }}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      >
                        {["Bekliyor", "Arandı", "Ulaşılamadı", "Tekrar Aranacak", "Kabul Edildi", "Reddedildi", "Alım Yapıldı"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Takip Tarihi */}
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">Tekrar Dönüş Tarihi</label>
                      <input
                        type="datetime-local"
                        defaultValue={lead.follow_up_at ? lead.follow_up_at.slice(0, 16) : ""}
                        onChange={(e) => {
                          const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                          onFollowUpChange(lead.id, val);
                        }}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
