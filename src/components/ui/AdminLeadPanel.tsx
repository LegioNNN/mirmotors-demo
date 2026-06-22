"use client";

import { useState, useEffect, useRef } from "react";
import type { LeadBuying, LeadStatus } from "@/types";
import { supabase } from "@/lib/supabase";
import { generateRedWhatsappUrl } from "@/utils/redWhatsapp";
import AdminLeadCard from "./AdminLeadCard";

interface AdminLeadPanelProps {
  leads: LeadBuying[];
  onStatusChange: (id: string, newStatus: LeadStatus) => void;
  onNoteChange: (id: string, adminNote: string | null) => void;
  onFollowUpChange?: (id: string, followUpAt: string | null) => void;
  notificationFilter?: "pending" | "today" | "overdue" | null;
  onClearNotificationFilter?: () => void;
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

export default function AdminLeadPanel({ leads, onStatusChange, onNoteChange, onFollowUpChange, notificationFilter, onClearNotificationFilter }: AdminLeadPanelProps) {
  const [openLeadId, setOpenLeadId] = useState<string | null>(leads.length > 0 ? leads[0].id : null);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"Tümü" | LeadStatus>("Tümü");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [editingFollowUpId, setEditingFollowUpId] = useState<string | null>(null);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [savingFollowUpId, setSavingFollowUpId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialFilter, setSpecialFilter] = useState<"Tümü" | "Bugün" | "Geciken">("Tümü");

  const countByStatus = {
    Tümü: leads.length,
    Bekliyor: leads.filter((l) => l.status === "Bekliyor").length,
    Arandı: leads.filter((l) => l.status === "Arandı").length,
    Ulaşılamadı: leads.filter((l) => l.status === "Ulaşılamadı").length,
    "Tekrar Aranacak": leads.filter((l) => l.status === "Tekrar Aranacak").length,
    "Kabul Edildi": leads.filter((l) => l.status === "Kabul Edildi").length,
    Reddedildi: leads.filter((l) => l.status === "Reddedildi").length,
    "Alım Yapıldı": leads.filter((l) => l.status === "Alım Yapıldı").length,
  };

  /* ------------------------------------------------------------------------ */
  /*  Arama + filtreleme                                                     */
  /* ------------------------------------------------------------------------ */
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

  // Önce status filtresini uygula, sonra arama ve özel filtre
  const statusFiltered =
    statusFilter === "Tümü" ? leads : leads.filter((l) => l.status === statusFilter);

  const searchedLeads = statusFiltered.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLocaleLowerCase("tr-TR");
    const name = (l.customer_name ?? "").toLocaleLowerCase("tr-TR");
    const phone = (l.phone ?? "").replace(/\s/g, "").toLocaleLowerCase("tr-TR");
    const brand = (l.brand ?? "").toLocaleLowerCase("tr-TR");
    const model = (l.model ?? "").toLocaleLowerCase("tr-TR");
    const cleanQ = q.replace(/\s/g, "");
    return (
      name.includes(q) ||
      phone.includes(cleanQ) ||
      brand.includes(q) ||
      model.includes(q)
    );
  });

  /* ------------------------------------------------------------------------ */
  /*  Filtre: notificationFilter → statusFilter/specialFilter senkronizasyonu  */
  /* ------------------------------------------------------------------------ */
  // notificationFilter parent'tan (LeadNotificationBar'dan) gelir.
  // İlk lead'i otomatik aç
  useEffect(() => {
    if (leads.length > 0 && !openLeadId) {
      setOpenLeadId(leads[0].id);
    }
  }, [leads, openLeadId]);

  // useEffect ile statusFilter/specialFilter ayarlanır, böylece
  // filteredLeads sadece statusFilter + specialFilter kombinasyonuna bakar
  const prevNotificationFilterRef = useRef(notificationFilter);
  useEffect(() => {
    if (notificationFilter !== prevNotificationFilterRef.current) {
      prevNotificationFilterRef.current = notificationFilter;
      if (notificationFilter === "pending") {
        setStatusFilter("Bekliyor");
        setSpecialFilter("Tümü");
      } else if (notificationFilter === "today") {
        setStatusFilter("Tümü");
        setSpecialFilter("Bugün");
      } else if (notificationFilter === "overdue") {
        setStatusFilter("Tümü");
        setSpecialFilter("Geciken");
      }
    }
  }, [notificationFilter]);

  const filteredLeads = searchedLeads.filter((l) => {
    // Sadece specialFilter kontrol edilir; notificationFilter useEffect ile
    // statusFilter/specialFilter'a dönüştürülür, burada ayrıca kontrol gerekmez
    if (specialFilter === "Bugün") {
      return !!(l.follow_up_at && isTodayFollowUp(l.follow_up_at));
    }
    if (specialFilter === "Geciken") {
      return !!(l.follow_up_at && isOverdue(l.follow_up_at));
    }
    return true;
  });


  const statusLabel = (s: string): string => {
    if (s === "Tekrar Aranacak") return "Tekrar Dönüş Yapılacak";
    return s;
  };

  const filterTabs: { key: "Tümü" | LeadStatus; label: string }[] = [
    { key: "Tümü", label: "Tümü" },
    ...allStatuses.map((s) => ({ key: s as "Tümü" | LeadStatus, label: statusLabel(s) })),
  ];

  const searchInputId = "lead-search";

  /* ------------------------------------------------------------------------ */
  /*  Status güncelleme yardımcısı                                            */
  /* ------------------------------------------------------------------------ */
  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    setUpdatingLeadId(leadId);
    const { error } = await supabase
      .from("leads_buying")
      .update({ status: newStatus })
      .eq("id", leadId);

    if (!error) {
      onStatusChange(leadId, newStatus);
    } else {
      console.error("Lead status güncellenemedi:", error.message);
    }
    setUpdatingLeadId(null);
  };

  const handleAccept = async (lead: LeadBuying) => {
    await updateLeadStatus(lead.id, "Kabul Edildi");
    if (lead.phone) {
      const cleaned = lead.phone.replace(/^\+/, "").replace(/[^0-9]/g, "");
      if (cleaned) window.open(`tel:${cleaned}`, "_blank");
    }
  };

  const handleReject = async (lead: LeadBuying) => {
    await updateLeadStatus(lead.id, "Reddedildi");
    const phone = lead.phone || "";
    const url = generateRedWhatsappUrl(phone, lead.brand, lead.model, lead.year);
    if (phone) window.open(url, "_blank", "noopener,noreferrer");
  };

  /* ------------------------------------------------------------------------ */
  /*  Admin notu yardımcıları                                                 */
  /* ------------------------------------------------------------------------ */
  const startEditingNote = (lead: LeadBuying) => {
    setEditingNoteId(lead.id);
    setNoteText(lead.admin_note ?? "");
    setNoteError(null);
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setNoteText("");
    setNoteError(null);
  };

  const saveNote = async (leadId: string) => {
    setSavingNoteId(leadId);
    setNoteError(null);
    const value = noteText.trim() === "" ? null : noteText.trim();
    const { error } = await supabase
      .from("leads_buying")
      .update({ admin_note: value })
      .eq("id", leadId);

    if (!error) {
      onNoteChange(leadId, value);
      setEditingNoteId(null);
      setNoteText("");
    } else {
      console.error("Admin notu kaydedilemedi:", error.message);
      setNoteError("Not kaydedilemedi. Tekrar deneyin.");
    }
    setSavingNoteId(null);
  };

  /* ------------------------------------------------------------------------ */
  /*  Tekrar arama tarihi yardımcıları                                        */
  /* ------------------------------------------------------------------------ */
  const startEditingFollowUp = (lead: LeadBuying) => {
    setEditingFollowUpId(lead.id);
    if (lead.follow_up_at) {
      const d = new Date(lead.follow_up_at);
      const localStr = d.toLocaleString("sv-SE", { timeZone: "Europe/Istanbul" });
      const [datePart, timePart] = localStr.split(" ");
      setFollowUpDate(datePart);
      setFollowUpTime(timePart?.slice(0, 5) || "");
    } else {
      const now = new Date();
      const localStr = now.toLocaleString("sv-SE", { timeZone: "Europe/Istanbul" });
      const [datePart] = localStr.split(" ");
      setFollowUpDate(datePart);
      setFollowUpTime("");
    }
  };

  const cancelEditingFollowUp = () => {
    setEditingFollowUpId(null);
    setFollowUpDate("");
    setFollowUpTime("");
  };

  const saveFollowUp = async (leadId: string) => {
    if (!followUpDate) return;
    setSavingFollowUpId(leadId);
    const dateTimeStr = followUpTime
      ? `${followUpDate}T${followUpTime}:00`
      : `${followUpDate}T00:00:00`;
    // Store as ISO string; Supabase timestamptz will handle timezone
    const value = new Date(dateTimeStr).toISOString();
    const { error } = await supabase
      .from("leads_buying")
      .update({ follow_up_at: value, status: "Tekrar Aranacak" })
      .eq("id", leadId);

    if (!error) {
      onFollowUpChange?.(leadId, value);
      onStatusChange(leadId, "Tekrar Aranacak");
      setEditingFollowUpId(null);
      setFollowUpDate("");
      setFollowUpTime("");
    } else {
      console.error("Takip tarihi kaydedilemedi:", error.message);
    }
    setSavingFollowUpId(null);
  };

  const removeFollowUp = async (leadId: string) => {
    setSavingFollowUpId(leadId);
    const { error } = await supabase
      .from("leads_buying")
      .update({ follow_up_at: null })
      .eq("id", leadId);

    if (!error) {
      onFollowUpChange?.(leadId, null);
    } else {
      console.error("Takip tarihi kaldırılamadı:", error.message);
    }
    setSavingFollowUpId(null);
  };

  if (leads.length === 0 && !notificationFilter && statusFilter === "Tümü" && specialFilter === "Tümü" && !searchQuery.trim()) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col items-center gap-3 py-14 text-gray-400">
          <svg className="h-14 w-14 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Henüz araç alım talebi yok.</p>
            <p className="mt-1 text-xs text-gray-400">
              Müşteri Aracını Sat formunu doldurduğunda burada görünecek.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-[#f8f9fb] px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-base font-black text-[#111827]">Araç Alım Talepleri</h2>
          <p className="mt-0.5 text-[11px] text-gray-400">
            {leads.length} toplam · {countByStatus["Bekliyor"]} bekliyor
            {countByStatus["Tekrar Aranacak"] > 0 && ` · ${countByStatus["Tekrar Aranacak"]} tekrar dönüş`}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111827] shadow-sm">
          <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>

      {/* ── Arama + özel filtreler ── */}
      <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id={searchInputId}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İsim, telefon, marka veya model ara..."
              className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-700 outline-none focus:border-[#111827] placeholder:text-gray-400"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex gap-1.5">
            {([
              { key: "Bugün" as const, label: "Bugün", active: "border-amber-400 bg-amber-50 text-amber-700" },
              { key: "Geciken" as const, label: "Gecikenler", active: "border-red-400 bg-red-50 text-red-600" },
            ]).map((sf) => (
              <button key={sf.key} type="button"
                onClick={() => { setSpecialFilter(specialFilter === sf.key ? "Tümü" : sf.key); onClearNotificationFilter?.(); }}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  specialFilter === sf.key ? sf.active : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                }`}>
                {sf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Durum filtreleri ── */}
      <div className="border-b border-gray-100 px-4 py-2.5 sm:px-5">
        <div className="flex flex-wrap gap-1.5">
          {filterTabs.map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button key={tab.key} type="button"
                onClick={() => { setStatusFilter(tab.key); onClearNotificationFilter?.(); }}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  active
                    ? "border-[#111827] bg-[#111827] text-white shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}>
                {tab.label}
                <span className={`inline-flex min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-tight ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {countByStatus[tab.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {filteredLeads.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
          <svg className="h-8 w-8 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p className="text-sm font-medium text-gray-500">
            {searchQuery.trim()
              ? "Aramanızla eşleşen talep bulunamadı."
              : statusFilter !== "Tümü"
              ? "Bu durumda talep bulunmuyor."
              : specialFilter === "Bugün"
              ? "Bugün dönüş yapılacak talep bulunmuyor."
              : specialFilter === "Geciken"
              ? "Gecikmiş talep bulunmuyor."
              : "Henüz araç alım talebi bulunmuyor."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filteredLeads.map((lead) => {
            const isUpdating = updatingLeadId === lead.id;
            const isTerminal = lead.status === "Kabul Edildi" || lead.status === "Reddedildi" || lead.status === "Alım Yapıldı";

            const followUpWarning = lead.follow_up_at
              ? isOverdue(lead.follow_up_at)
                ? "overdue"
                : isTodayFollowUp(lead.follow_up_at)
                ? "today"
                : null
              : null;

            return (
              <AdminLeadCard
                key={lead.id}
                lead={lead}
                isOpen={openLeadId === lead.id}
                onToggle={(id) => setOpenLeadId((prev) => (prev === id ? null : id))}
                isUpdating={isUpdating}
                isTerminal={isTerminal}
                editingNoteId={editingNoteId}
                noteText={noteText}
                savingNoteId={savingNoteId}
                noteError={noteError}
                editingFollowUpId={editingFollowUpId}
                followUpDate={followUpDate}
                followUpTime={followUpTime}
                savingFollowUpId={savingFollowUpId}
                followUpWarning={followUpWarning}
                onStartEditNote={startEditingNote}
                onNoteTextChange={setNoteText}
                onSaveNote={saveNote}
                onCancelEditNote={cancelEditingNote}
                onStatusChange={updateLeadStatus}
                onAccept={handleAccept}
                onReject={handleReject}
                onStartEditFollowUp={startEditingFollowUp}
                onFollowUpDateChange={setFollowUpDate}
                onFollowUpTimeChange={setFollowUpTime}
                onSaveFollowUp={saveFollowUp}
                onCancelEditFollowUp={cancelEditingFollowUp}
                onRemoveFollowUp={removeFollowUp}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
