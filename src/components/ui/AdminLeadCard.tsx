"use client";

import { useState } from "react";
import type { LeadBuying, LeadStatus } from "@/types";

interface AdminLeadCardProps {
  lead: LeadBuying;
  isOpen: boolean;
  onToggle: (id: string) => void;
  isUpdating: boolean;
  isTerminal: boolean;
  editingNoteId: string | null;
  noteText: string;
  savingNoteId: string | null;
  noteError: string | null;
  editingFollowUpId: string | null;
  followUpDate: string;
  followUpTime: string;
  savingFollowUpId: string | null;
  followUpWarning: "overdue" | "today" | null;
  onStartEditNote: (lead: LeadBuying) => void;
  onNoteTextChange: (text: string) => void;
  onSaveNote: (leadId: string) => void;
  onCancelEditNote: () => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onAccept: (lead: LeadBuying) => void;
  onReject: (lead: LeadBuying) => void;
  onStartEditFollowUp: (lead: LeadBuying) => void;
  onFollowUpDateChange: (date: string) => void;
  onFollowUpTimeChange: (time: string) => void;
  onSaveFollowUp: (leadId: string) => void;
  onCancelEditFollowUp: () => void;
  onRemoveFollowUp: (leadId: string) => void;
}

const allStatuses: LeadStatus[] = [
  "Bekliyor", "Arandı", "Ulaşılamadı", "Tekrar Aranacak",
  "Kabul Edildi", "Reddedildi", "Alım Yapıldı",
];

const formatPrice = (n: number | null | undefined) =>
  n != null ? new Intl.NumberFormat("tr-TR").format(n) + " ₺" : null;

const formatFollowUpDate = (isoStr: string) => {
  try {
    return new Date(isoStr).toLocaleDateString("tr-TR", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul",
    });
  } catch { return isoStr; }
};

const statusConfig: Record<LeadStatus, { label: string; pill: string; bar: string }> = {
  Bekliyor:          { label: "Bekliyor",      pill: "bg-amber-100 text-amber-700",     bar: "bg-amber-400" },
  Arandı:            { label: "Arandı",         pill: "bg-sky-100 text-sky-700",         bar: "bg-sky-400" },
  Ulaşılamadı:       { label: "Ulaşılamadı",   pill: "bg-orange-100 text-orange-700",   bar: "bg-orange-400" },
  "Tekrar Aranacak": { label: "Tekrar Dönüş",  pill: "bg-purple-100 text-purple-700",   bar: "bg-purple-500" },
  "Kabul Edildi":    { label: "Kabul Edildi",   pill: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500" },
  Reddedildi:        { label: "Reddedildi",     pill: "bg-red-100 text-red-600",         bar: "bg-red-400" },
  "Alım Yapıldı":    { label: "Alım Yapıldı",  pill: "bg-teal-100 text-teal-700",       bar: "bg-teal-500" },
};

export default function AdminLeadCard({
  lead, isOpen, onToggle, isUpdating, isTerminal,
  editingNoteId, noteText, savingNoteId, noteError,
  editingFollowUpId, followUpDate, followUpTime, savingFollowUpId,
  followUpWarning,
  onStartEditNote, onNoteTextChange, onSaveNote, onCancelEditNote,
  onStatusChange, onAccept, onReject,
  onStartEditFollowUp, onFollowUpDateChange, onFollowUpTimeChange,
  onSaveFollowUp, onCancelEditFollowUp, onRemoveFollowUp,
}: AdminLeadCardProps) {
  const open = isOpen;
  const cfg = statusConfig[lead.status];

  const accentBar = followUpWarning === "overdue"
    ? "bg-red-500" : followUpWarning === "today"
    ? "bg-amber-400" : cfg.bar;

  const hasPhotos = (lead.photo_urls?.length ?? 0) > 0;
  const price = formatPrice(lead.expected_price);

  return (
    <div className={`relative flex border-b border-gray-100 ${lead.status === "Reddedildi" ? "opacity-60" : ""}`}>
      {/* Sol renk çubuğu */}
      <div className={`w-1 shrink-0 ${accentBar}`} />

      <div className="flex-1 min-w-0">

        {/* ── KOMPAKt SATIR — her zaman görünür, tıklanabilir ── */}
        <button
          type="button"
          onClick={() => onToggle(lead.id)}
          className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 sm:px-5 ${open ? "bg-[#111827] hover:bg-[#1a2333]" : "hover:bg-gray-50/60"}`}
        >
          {/* İsim */}
          <span className={`min-w-0 flex-1 truncate text-sm font-black ${open ? "text-white" : "text-[#111827]"}`}>
            {lead.customer_name || "İsimsiz Müşteri"}
          </span>

          {/* Araç · yıl · fiyat */}
          <span className="hidden shrink-0 text-xs sm:block">
            <span className={`font-semibold ${open ? "text-gray-300" : "text-gray-700"}`}>{lead.brand} {lead.model}</span>
            {lead.year ? <span className={open ? "text-gray-500" : "text-gray-400"}> · {lead.year}</span> : null}
            {price ? <span className={`ml-2 font-bold ${open ? "text-white" : "text-[#111827]"}`}>{price}</span> : null}
          </span>

          {/* Durum badge */}
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.pill}`}>
            {cfg.label}
          </span>

          {/* Gecikme / bugün uyarısı */}
          {followUpWarning && (
            <span className={`hidden shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold sm:inline-flex ${followUpWarning === "overdue" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
              {followUpWarning === "overdue" ? "GECİKTİ" : "BUGÜN"}
            </span>
          )}

          {/* Fotoğraf göstergesi */}
          {hasPhotos && (
            <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-blue-500">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              {lead.photo_urls!.length}
            </span>
          )}

          {/* Ok ikonu */}
          <svg className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-white" : "text-gray-400"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* ── DETAY PANELİ ── */}
        <div className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
          <div className="border-t border-gray-100 bg-gray-50/40 px-4 pb-4 pt-4 sm:px-5">

            {/* Araç + Fiyat + Telefon — büyük özet */}
            <div className="mb-4 flex flex-wrap items-start gap-6">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Araç</p>
                <p className="mt-0.5 text-base font-black text-[#111827]">
                  {lead.brand} {lead.model}
                  {lead.year ? <span className="ml-2 text-sm font-normal text-gray-400">· {lead.year}</span> : null}
                </p>
              </div>
              {price && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Beklenen Fiyat</p>
                  <p className="mt-0.5 text-base font-black text-emerald-600">{price}</p>
                </div>
              )}
              {lead.phone && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Telefon</p>
                  <a
                    href={`tel:${lead.phone.replace(/^\+/, "").replace(/[^0-9]/g, "")}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5 flex items-center gap-1.5 text-base font-bold text-[#111827] hover:text-emerald-600 transition-colors"
                  >
                    <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12 19.79 19.79 0 0 1 1.06 3.38 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {lead.phone}
                  </a>
                </div>
              )}
            </div>

            {/* Detay grid */}
            <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-gray-200 bg-white p-3 sm:grid-cols-3 lg:grid-cols-4">
              {lead.city && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Şehir</p>
                  <p className="mt-0.5 text-xs font-semibold text-gray-700">{lead.city}{lead.district ? ` / ${lead.district}` : ""}</p>
                </div>
              )}
              {lead.km && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Kilometre</p>
                  <p className="mt-0.5 text-xs font-semibold text-gray-700">{lead.km} km</p>
                </div>
              )}
              {lead.contact_preference && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">İletişim Tercihi</p>
                  <p className="mt-0.5 text-xs font-semibold text-gray-700">{lead.contact_preference}</p>
                </div>
              )}
              {lead.has_tramer != null && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Tramer</p>
                  <p className={`mt-0.5 text-xs font-bold ${lead.has_tramer ? "text-red-600" : "text-emerald-600"}`}>
                    {lead.has_tramer ? "⚠ Var" : "✓ Yok"}
                  </p>
                </div>
              )}
              {lead.damage_note && (
                <div className="col-span-2">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Hasar Notu</p>
                  <p className="mt-0.5 text-xs font-semibold text-gray-700">{lead.damage_note}</p>
                </div>
              )}
              {lead.wants_trade != null && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Takas İster mi?</p>
                  <p className={`mt-0.5 text-xs font-bold ${lead.wants_trade ? "text-amber-600" : "text-gray-500"}`}>
                    {lead.wants_trade ? "Evet, istiyor" : "Hayır"}
                  </p>
                </div>
              )}
              {lead.kvkk_accepted != null && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">KVKK</p>
                  <p className={`mt-0.5 text-xs font-bold ${lead.kvkk_accepted ? "text-emerald-600" : "text-red-500"}`}>
                    {lead.kvkk_accepted ? "✓ Onaylı" : "Onaysız"}
                  </p>
                </div>
              )}
            </div>

            {/* Müşteri notu */}
            {lead.extra_note && (
              <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-blue-400">Müşteri Notu</p>
                <p className="mt-1 text-xs text-gray-700">{lead.extra_note}</p>
              </div>
            )}

            {/* Araç fotoğrafları */}
            {hasPhotos && (
              <div className="mb-4">
                <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  Araç Fotoğrafları · {lead.photo_urls!.length} adet
                </p>
                <div className="flex flex-wrap gap-2">
                  {lead.photo_urls!.map((url, idx) => (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="block h-20 w-28 overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:opacity-80 hover:shadow-md transition-all">
                      <img src={url} alt={`Araç ${idx + 1}`} className="h-full w-full object-cover" loading="lazy" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Takip tarihi */}
            {lead.follow_up_at && editingFollowUpId !== lead.id && (
              <div className={`mb-4 inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${
                followUpWarning === "overdue" ? "bg-red-50 text-red-700" :
                followUpWarning === "today" ? "bg-amber-50 text-amber-700" : "bg-purple-50 text-purple-700"
              }`}>
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Tekrar arama: {formatFollowUpDate(lead.follow_up_at)}
                <button type="button" onClick={(e) => { e.stopPropagation(); onStartEditFollowUp(lead); }} className="opacity-50 hover:opacity-100">
                  <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); onRemoveFollowUp(lead.id); }} className="opacity-50 hover:text-red-500 hover:opacity-100">
                  <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}

            {/* Takip tarihi edit modu */}
            {editingFollowUpId === lead.id && (
              <div className="mb-4 flex flex-wrap items-center gap-1.5">
                <input type="date" value={followUpDate} onChange={(e) => onFollowUpDateChange(e.target.value)}
                  className="w-32 rounded-lg border border-purple-200 px-2.5 py-1.5 text-sm outline-none focus:border-purple-400" />
                <input type="time" value={followUpTime} onChange={(e) => onFollowUpTimeChange(e.target.value)}
                  className="w-20 rounded-lg border border-purple-200 px-2.5 py-1.5 text-sm outline-none focus:border-purple-400" />
                <button type="button" disabled={savingFollowUpId === lead.id || !followUpDate} onClick={() => onSaveFollowUp(lead.id)}
                  className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-bold text-white disabled:opacity-40">
                  {savingFollowUpId === lead.id ? "..." : "Kaydet"}
                </button>
                <button type="button" onClick={onCancelEditFollowUp}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-white">İptal</button>
              </div>
            )}

            {/* Admin notu */}
            <div className={`mb-4 rounded-xl border p-3 ${lead.admin_note ? "border-amber-200 bg-amber-50/60" : "border-gray-200 bg-white"}`}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Admin Notu</p>
                {editingNoteId !== lead.id && (
                  <button type="button" onClick={() => onStartEditNote(lead)}
                    className="text-[10px] font-semibold text-gray-400 hover:text-[#111827] transition-colors">
                    {lead.admin_note ? "Düzenle" : "+ Not Ekle"}
                  </button>
                )}
              </div>
              {editingNoteId === lead.id ? (
                <div className="space-y-2">
                  <textarea rows={3} value={noteText} onChange={(e) => onNoteTextChange(e.target.value)}
                    autoFocus placeholder="Not ekleyin..."
                    className="w-full resize-none rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#111827] placeholder:text-gray-300" />
                  {noteError && <p className="text-[10px] text-red-500">{noteError}</p>}
                  <div className="flex gap-2">
                    <button type="button" disabled={savingNoteId === lead.id} onClick={() => onSaveNote(lead.id)}
                      className="rounded-lg bg-[#111827] px-3 py-1.5 text-[10px] font-bold text-white disabled:opacity-40">
                      {savingNoteId === lead.id ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                    <button type="button" onClick={onCancelEditNote}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-[10px] text-gray-500 hover:bg-gray-50">Vazgeç</button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-700">
                  {lead.admin_note || <span className="italic text-gray-300">Henüz not eklenmemiş</span>}
                </p>
              )}
            </div>

            {/* Aksiyon butonları */}
            <div className="flex flex-wrap items-center gap-1.5">
              {!isTerminal && (
                <>
                  <button type="button" disabled={isUpdating} onClick={() => onAccept(lead)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors disabled:opacity-40 shadow-sm">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
                    Kabul Et / Ara
                  </button>
                  <button type="button" disabled={isUpdating} onClick={() => onStatusChange(lead.id, "Arandı")}
                    className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-bold text-white hover:bg-sky-500 transition-colors disabled:opacity-40 shadow-sm">
                    Arandı
                  </button>
                  <button type="button" disabled={isUpdating} onClick={() => onStatusChange(lead.id, "Ulaşılamadı")}
                    className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white hover:bg-orange-400 transition-colors disabled:opacity-40 shadow-sm">
                    Ulaşılamadı
                  </button>
                  <button type="button" disabled={isUpdating} onClick={() => onStartEditFollowUp(lead)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-xs font-bold text-white hover:bg-purple-500 transition-colors disabled:opacity-40 shadow-sm">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Tekrar Ara
                  </button>
                  <button type="button" disabled={isUpdating} onClick={() => onReject(lead)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-40">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Reddet
                  </button>
                </>
              )}

              <div className="ml-auto">
                <select value={lead.status} disabled={isUpdating}
                  onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs font-semibold text-gray-600 outline-none focus:border-gray-400 disabled:opacity-40 cursor-pointer">
                  {allStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
