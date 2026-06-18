"use client";

import type { LeadBuying, LeadStatus } from "@/types";

interface AdminLeadCardProps {
  lead: LeadBuying;
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
  "Bekliyor",
  "Arandı",
  "Ulaşılamadı",
  "Tekrar Aranacak",
  "Kabul Edildi",
  "Reddedildi",
  "Alım Yapıldı",
];

const formatPrice = (n: number | null | undefined) =>
  n != null ? new Intl.NumberFormat("tr-TR").format(n) : "Fiyat belirtilmedi";

const statusConfig: Record<LeadStatus, { label: string; bg: string; text: string; dot: string }> = {
  Bekliyor: { label: "BEKLİYOR", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  Arandı: { label: "ARANDI", bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-400" },
  Ulaşılamadı: { label: "ULAŞILAMADI", bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
  "Tekrar Aranacak": { label: "TEKRAR DÖNÜŞ YAPILACAK", bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
  "Kabul Edildi": { label: "KABUL EDİLDİ", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  Reddedildi: { label: "REDDEDİLDİ", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
  "Alım Yapıldı": { label: "ALIM YAPILDI", bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-400" },
};

const quickActions: { status: LeadStatus; label: string; color: string }[] = [
  { status: "Arandı", label: "Arandı", color: "bg-sky-600" },
  { status: "Ulaşılamadı", label: "Ulaşılamadı", color: "bg-orange-600" },
  { status: "Tekrar Aranacak", label: "Tekrar Dönüş Yapılacak", color: "bg-purple-600" },
];

const formatFollowUpDate = (isoStr: string) => {
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Istanbul",
    });
  } catch {
    return isoStr;
  }
};

const infoChips = (lead: LeadBuying) =>
  [
    { label: "Beklenen", value: `${formatPrice(lead.expected_price)}${lead.expected_price ? " ₺" : ""}` },
    { label: "Şehir", value: lead.city || "-" },
    { label: "İlçe", value: lead.district || "-" },
    { label: "İletişim", value: lead.contact_preference || "-" },
    { label: "KM", value: lead.km || "-" },
    { label: "Hasar", value: lead.damage_note || "-" },
    { label: "Tramer", value: lead.has_tramer === true ? "Var" : lead.has_tramer === false ? "Yok" : "-" },
    { label: "Takas", value: lead.wants_trade === true ? "Düşünüyor" : lead.wants_trade === false ? "Düşünmüyor" : "-" },
    { label: "KVKK", value: lead.kvkk_accepted === true ? "Onaylı" : lead.kvkk_accepted === false ? "Yok" : "-" },
    { label: "Ek Not", value: lead.extra_note || "-", fullWidth: true } as const,
  ] as const;

export default function AdminLeadCard({
  lead,
  isUpdating,
  isTerminal,
  editingNoteId,
  noteText,
  savingNoteId,
  noteError,
  editingFollowUpId,
  followUpDate,
  followUpTime,
  savingFollowUpId,
  followUpWarning,
  onStartEditNote,
  onNoteTextChange,
  onSaveNote,
  onCancelEditNote,
  onStatusChange,
  onAccept,
  onReject,
  onStartEditFollowUp,
  onFollowUpDateChange,
  onFollowUpTimeChange,
  onSaveFollowUp,
  onCancelEditFollowUp,
  onRemoveFollowUp,
}: AdminLeadCardProps) {
  const cfg = statusConfig[lead.status];

  const edgeClass =
    followUpWarning === "overdue"
      ? "before:bg-red-500"
      : followUpWarning === "today"
      ? "before:bg-amber-400"
      : "before:bg-gray-200 before:group-hover:bg-gray-300";

  return (
    <div
      className={`group relative pl-5 pr-5 py-4 sm:px-6 transition-all duration-150 hover:shadow-md hover:border-gray-300 ${
        lead.status === "Reddedildi" ? "opacity-50" : "border-b border-gray-100"
      } before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r before:transition-colors ${edgeClass}`}
    >
      {/* Üst: İsim + Telefon + Araç + Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-[#111827]">
            {lead.customer_name || "İsimsiz Müşteri"}
          </h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-1">
              <svg className="h-3 w-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {lead.phone || "-"}
            </span>
            <span className="text-gray-300">•</span>
            <span className="inline-flex items-center gap-1 font-medium text-gray-600">
              <svg className="h-3 w-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {lead.brand} {lead.model}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500">{lead.year || "—"}</span>
            <span className="text-gray-300">•</span>
            <span className="font-semibold text-[#111827]">
              {formatPrice(lead.expected_price)}{lead.expected_price ? " ₺" : ""}
            </span>
          </div>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm ${cfg.bg} ${cfg.text}`}>
          <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      {/* Info Chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {infoChips(lead).map((chip, i) => (
          <div
            key={i}
            className={`inline-flex items-center gap-1 rounded-md border border-gray-100 bg-gray-50 px-2 py-1 text-[10px] text-gray-600 ${
              "fullWidth" in chip && chip.fullWidth ? "w-full" : ""
            }`}
          >
            <span className="font-semibold uppercase tracking-wider text-gray-400">{chip.label}:</span>
            <span className="truncate max-w-[120px]">{chip.value}</span>
          </div>
        ))}
      </div>

      {lead.photo_urls && lead.photo_urls.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Araç Fotoğrafları</p>
          <div className="flex flex-wrap gap-2">
            {lead.photo_urls.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition-opacity hover:opacity-80 sm:h-20 sm:w-20"
              >
                <img
                  src={url}
                  alt={`Araç fotoğrafı ${idx + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Admin Notu — amber */}
      <div
        className={`mt-3 rounded-lg border p-3 transition-colors ${
          lead.admin_note ? "border-amber-200 bg-amber-50/70" : "border-gray-100 bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Admin Notu
          </span>
          {editingNoteId !== lead.id && (
            <button
              type="button"
              onClick={() => onStartEditNote(lead)}
              className="text-[10px] font-semibold text-gray-500 hover:text-[#111827] transition-colors"
            >
              {lead.admin_note ? "Düzenle" : "Not Ekle"}
            </button>
          )}
        </div>
        {editingNoteId === lead.id ? (
          <div className="mt-2 space-y-2">
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => onNoteTextChange(e.target.value)}
              placeholder="Admin notunuzu yazın..."
              className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-xs text-gray-700 outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-[#111827]/20 resize-none placeholder:text-gray-300"
            />
            {noteError && <p className="text-[10px] text-red-500">{noteError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={savingNoteId === lead.id}
                onClick={() => onSaveNote(lead.id)}
                className="rounded-lg bg-[#111827] px-3 py-1.5 text-[10px] font-bold text-white hover:bg-gray-800 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                {savingNoteId === lead.id ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button
                type="button"
                disabled={savingNoteId === lead.id}
                onClick={onCancelEditNote}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                Vazgeç
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1.5 text-xs text-gray-700">
            {lead.admin_note || <span className="italic text-gray-400">Henüz not eklenmemiş</span>}
          </p>
        )}
      </div>

      {/* Durum + Hızlı Aksiyonlar */}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/60 px-2.5 py-1.5">
          <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Durum</label>
          <select
            value={lead.status}
            disabled={isUpdating}
            onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
            className="rounded-md border-0 bg-transparent px-1 py-0 text-[11px] font-semibold text-gray-700 outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {allStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {!isTerminal && (
          <div className="flex gap-1.5 flex-wrap">
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onAccept(lead)}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-500 transition-colors disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Kabul Et / Ara
            </button>

            {quickActions.map((qa) => {
              if (qa.status === "Tekrar Aranacak") {
                return (
                  <div key={qa.status}>
                    {editingFollowUpId === lead.id ? (
                      <div className="flex flex-wrap items-center gap-1">
                        <input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => onFollowUpDateChange(e.target.value)}
                          className="w-28 rounded-lg border border-purple-200 bg-white px-2 py-1.5 text-[10px] text-gray-700 outline-none focus:border-purple-400"
                        />
                        <input
                          type="time"
                          value={followUpTime}
                          onChange={(e) => onFollowUpTimeChange(e.target.value)}
                          className="w-16 rounded-lg border border-purple-200 bg-white px-2 py-1.5 text-[10px] text-gray-700 outline-none focus:border-purple-400"
                        />
                        <button
                          type="button"
                          disabled={savingFollowUpId === lead.id || !followUpDate}
                          onClick={() => onSaveFollowUp(lead.id)}
                          className="rounded-lg bg-purple-600 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-purple-500 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {savingFollowUpId === lead.id ? "..." : "Kaydet"}
                        </button>
                        <button
                          type="button"
                          disabled={savingFollowUpId === lead.id}
                          onClick={onCancelEditFollowUp}
                          className="rounded-lg border border-purple-200 bg-white px-2 py-1.5 text-[10px] font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          İptal
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => onStartEditFollowUp(lead)}
                        className={`inline-flex items-center gap-1 rounded-lg ${qa.color} px-2.5 py-1.5 text-[10px] font-bold text-white hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-40 shadow-sm`}
                      >
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {qa.label}
                      </button>
                    )}
                  </div>
                );
              }
              return (
                <button
                  key={qa.status}
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onStatusChange(lead.id, qa.status)}
                  className={`inline-flex items-center gap-1 rounded-lg ${qa.color} px-2.5 py-1.5 text-[10px] font-bold text-white hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-40 shadow-sm`}
                >
                  {qa.status === "Arandı" && (
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  )}
                  {qa.status === "Ulaşılamadı" && (
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  )}
                  {qa.label}
                </button>
              );
            })}

            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onReject(lead)}
              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-red-500 transition-colors disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Nazikçe Reddet
            </button>
          </div>
        )}
      </div>

      {/* Alt Bilgi */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono bg-gray-100 text-gray-400 rounded px-1.5 py-0.5">#{lead.id}</span>
          {lead.follow_up_at && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                followUpWarning === "overdue"
                  ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                  : followUpWarning === "today"
                  ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                  : "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
              }`}
            >
              <svg
                className={`h-3 w-3 ${
                  followUpWarning === "overdue" ? "text-red-500" : followUpWarning === "today" ? "text-amber-500" : "text-purple-500"
                }`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {formatFollowUpDate(lead.follow_up_at)}
              {editingFollowUpId !== lead.id && (
                <>
                  <button type="button" onClick={() => onStartEditFollowUp(lead)} className="ml-0.5 hover:opacity-70 transition-opacity" title="Düzenle">
                    <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => onRemoveFollowUp(lead.id)} className="hover:text-red-500 transition-colors" title="Kaldır">
                    <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </>
              )}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {lead.status === "Kabul Edildi" && <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Müşteri aranacak</span>}
          {lead.status === "Reddedildi" && <span className="inline-flex items-center gap-1 text-[11px] text-red-500 font-medium"><span className="h-1.5 w-1.5 rounded-full bg-red-400" /> Red mesajı WhatsApp&apos;tan gönderildi</span>}
          {lead.status === "Alım Yapıldı" && <span className="inline-flex items-center gap-1 text-[11px] text-teal-600 font-medium"><span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> Alım tamamlandı</span>}
          {lead.status === "Arandı" && <span className="inline-flex items-center gap-1 text-[11px] text-sky-600 font-medium"><span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> Müşteri arandı</span>}
          {lead.status === "Ulaşılamadı" && <span className="inline-flex items-center gap-1 text-[11px] text-orange-600 font-medium"><span className="h-1.5 w-1.5 rounded-full bg-orange-400" /> Müşteriye ulaşılamadı</span>}
          {lead.status === "Tekrar Aranacak" && <span className="inline-flex items-center gap-1 text-[11px] text-purple-600 font-medium"><span className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Tekrar dönüş yapılacak</span>}
        </div>
      </div>
    </div>
  );
}
