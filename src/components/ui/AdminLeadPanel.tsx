"use client";

import type { LeadBuying, LeadStatus } from "@/types";
import { supabase } from "@/lib/supabase";
import { generateRedWhatsappUrl } from "@/utils/redWhatsapp";

interface AdminLeadPanelProps {
  leads: LeadBuying[];
  onStatusChange: (id: string, newStatus: LeadStatus) => void;
}

const formatPrice = (n: number) => new Intl.NumberFormat("tr-TR").format(n);

const statusConfig: Record<LeadStatus, { label: string; bg: string; text: string; dot: string }> = {
  Bekliyor: { label: "BEKLİYOR", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  "Kabul Edildi": { label: "KABUL EDİLDİ", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  Reddedildi: { label: "REDDEDİLDİ", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
};

export default function AdminLeadPanel({ leads, onStatusChange }: AdminLeadPanelProps) {
  const handleAccept = async (lead: LeadBuying) => {
    const { error } = await supabase
      .from("leads_buying")
      .update({ status: "Kabul Edildi" })
      .eq("id", lead.id);

    if (!error) {
      onStatusChange(lead.id, "Kabul Edildi");
      const cleaned = lead.phone.replace(/^\+/, "").replace(/[^0-9]/g, "");
      if (cleaned) window.open(`tel:${cleaned}`, "_blank");
    } else {
      console.error("Lead kabul edilemedi:", error.message);
    }
  };

  const handleReject = async (lead: LeadBuying) => {
    const { error } = await supabase
      .from("leads_buying")
      .update({ status: "Reddedildi" })
      .eq("id", lead.id);

    if (!error) {
      onStatusChange(lead.id, "Reddedildi");
      const url = generateRedWhatsappUrl(lead.phone, lead.brand, lead.model, lead.year);
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      console.error("Lead reddedilemedi:", error.message);
    }
  };

  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
          <p className="text-sm">Henüz araç alım talebi bulunmuyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 sm:px-6">
        <h2 className="text-sm font-bold text-[#111827]">Gelen Talepler</h2>
        <span className="rounded-md bg-gray-50 px-2 py-0.5 text-[11px] font-mono text-gray-500 border border-gray-100">
          {leads.length}
        </span>
      </div>
      <div className="divide-y divide-gray-100">
        {leads.map((lead) => {
          const cfg = statusConfig[lead.status];
          const disabled = lead.status !== "Bekliyor";
          return (
            <div key={lead.id} className={`px-5 py-4 sm:px-6 ${lead.status === "Reddedildi" ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-[#111827]">{lead.customer_name}</h3>
                  <p className="mt-0.5 truncate text-[11px] text-gray-500">{lead.phone}</p>
                </div>
                <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
                <div><span className="text-[10px] uppercase tracking-wider text-gray-400">Marka</span><p className="text-gray-700">{lead.brand}</p></div>
                <div><span className="text-[10px] uppercase tracking-wider text-gray-400">Model</span><p className="text-gray-700">{lead.model}</p></div>
                <div><span className="text-[10px] uppercase tracking-wider text-gray-400">Yıl</span><p className="text-gray-700">{lead.year}</p></div>
                <div><span className="text-[10px] uppercase tracking-wider text-gray-400">Beklenen</span><p className="font-semibold text-[#111827]">{formatPrice(lead.expected_price)} ₺</p></div>
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[10px] font-mono text-gray-400">#{lead.id}</span>
                {!disabled && (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleAccept(lead)}
                      className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-500">KABUL ET / ARA</button>
                    <button type="button" onClick={() => handleReject(lead)}
                      className="rounded-lg bg-red-600 px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-red-500">NAZİKÇE REDDET</button>
                  </div>
                )}
                {lead.status === "Kabul Edildi" && <span className="text-[11px] text-emerald-600">Müşteri aranacak</span>}
                {lead.status === "Reddedildi" && <span className="text-[11px] text-red-500">Red mesajı WhatsApp&apos;tan gönderildi</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
