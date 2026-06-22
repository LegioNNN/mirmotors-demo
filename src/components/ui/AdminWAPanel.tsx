"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { WhatsappNumber } from "@/types";

const inputClass = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#111827] placeholder-gray-400 outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]/10";

export default function AdminWAPanel() {
  const [numbers, setNumbers] = useState<WhatsappNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNumbers();
    // İlk kez ise default numaraları ekle
    setTimeout(() => {
      fetchNumbers().then(() => {
        supabase.from("whatsapp_numbers").select("*").then(({ data: nums }) => {
          if (!nums || nums.length === 0) {
            const defaults = [
              { phone_number: "5019443734", employee_name: "Anıl" },
              { phone_number: "5015956737", employee_name: "Osman" },
              { phone_number: "5310320250", employee_name: "İbrahim" },
            ];
            Promise.all(
              defaults.map(d =>
                supabase.from("whatsapp_numbers").insert({
                  phone_number: d.phone_number,
                  employee_name: d.employee_name,
                  is_active: true
                })
              )
            ).then(() => fetchNumbers());
          }
        });
      });
    }, 1000);
  }, []);

  async function fetchNumbers() {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("whatsapp_numbers")
      .select("*")
      .order("created_at", { ascending: true });
    if (err) setError(err.message);
    else setNumbers((data as WhatsappNumber[]) ?? []);
    setLoading(false);
  }

  async function handleAdd() {
    const phone = newPhone.replace(/[^0-9]/g, "");
    if (!phone || phone.length < 10) { setAddError("Geçerli bir telefon numarası girin."); return; }
    if (!newName.trim()) { setAddError("İsim zorunludur."); return; }
    setSaving(true); setAddError(null);
    const { data, error: err } = await supabase
      .from("whatsapp_numbers")
      .insert({ phone_number: phone, employee_name: newName.trim(), is_active: true })
      .select().single();
    if (err) { setAddError(err.message); setSaving(false); return; }
    setNumbers((prev) => [...prev, data as WhatsappNumber]);
    setNewPhone(""); setNewName("");
    setSaving(false);
  }

  async function handleToggle(num: WhatsappNumber) {
    setTogglingId(num.id);
    const { error: err } = await supabase
      .from("whatsapp_numbers")
      .update({ is_active: !num.is_active })
      .eq("id", num.id);
    if (!err) setNumbers((prev) => prev.map((n) => n.id === num.id ? { ...n, is_active: !n.is_active } : n));
    setTogglingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu numarayı silmek istediğinizden emin misiniz?")) return;
    setDeletingId(id);
    await supabase.from("whatsapp_numbers").delete().eq("id", id);
    setNumbers((prev) => prev.filter((n) => n.id !== id));
    setDeletingId(null);
  }

  const activeCount = numbers.filter((n) => n.is_active).length;

  return (
    <div className="space-y-4">
      {/* Başlık & özet */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">WhatsApp Round-Robin Numaraları</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              Müşteri WA butonuna bastığında sırayla bu numaralara yönlendirilir.
              Aktif: <span className="font-bold text-emerald-700">{activeCount}</span> / {numbers.length}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/10">
            <svg className="h-5 w-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

        {/* Numara listesi */}
        {loading ? (
          <div className="mt-4 space-y-2 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-lg bg-gray-100" />)}
          </div>
        ) : numbers.length === 0 ? (
          <p className="mt-4 text-center text-xs text-gray-400 py-6">Henüz numara eklenmemiş</p>
        ) : (
          <div className="mt-4 divide-y divide-gray-100">
            {numbers.map((num, idx) => (
              <div key={num.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                {/* Sıra */}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                  {idx + 1}
                </span>

                {/* Bilgi */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#111827]">{num.employee_name}</p>
                  <p className="text-xs text-gray-400 font-mono">
                    +{num.phone_number.startsWith("9") ? num.phone_number : "90" + num.phone_number}
                  </p>
                </div>

                {/* Aktif badge */}
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${num.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                  {num.is_active ? "Aktif" : "Pasif"}
                </span>

                {/* Toggle */}
                <button
                  type="button"
                  disabled={togglingId === num.id}
                  onClick={() => handleToggle(num)}
                  title={num.is_active ? "Pasife al" : "Aktife al"}
                  className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:border-gray-300 hover:text-gray-700 transition-colors disabled:opacity-40"
                >
                  {num.is_active ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>

                {/* Sil */}
                <button
                  type="button"
                  disabled={deletingId === num.id}
                  onClick={() => handleDelete(num.id)}
                  className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Yeni numara ekle */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-[#111827]">Yeni Numara Ekle</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500">Çalışan Adı</label>
            <input type="text" value={newName} onChange={(e) => { setNewName(e.target.value); setAddError(null); }}
              placeholder="Örn: Anıl Sancaktar"
              className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500">Telefon (başında 90)</label>
            <input type="text" inputMode="numeric" value={newPhone}
              onChange={(e) => { setNewPhone(e.target.value.replace(/[^0-9]/g, "")); setAddError(null); }}
              placeholder="905019443734"
              className={inputClass} />
          </div>
        </div>
        {addError && <p className="mt-2 text-xs text-red-500">{addError}</p>}
        <div className="mt-3 flex justify-end">
          <button type="button" onClick={handleAdd} disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-gray-800 active:scale-[0.97] disabled:opacity-40">
            {saving ? "Ekleniyor..." : "+ Ekle"}
          </button>
        </div>
      </div>

      {/* SancakBot — Claude AI Powered Assistant */}
      <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-violet-50/50 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#111827]">🤖 SancakBot — AI Asistan</h3>
            <p className="mt-0.5 text-xs text-gray-600">Claude AI tarafından yönetilen 24/7 müşteri asistanı</p>
          </div>
          <div className="text-3xl">🤖</div>
        </div>

        <div className="space-y-3">
          {/* WhatsApp Numarası */}
          <div className="rounded-lg bg-white border border-violet-100 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-700">WhatsApp Numarası</p>
            <p className="mt-1.5 font-mono text-sm font-bold text-[#111827]">+90 XXX XXX XX XX</p>
            <p className="mt-1 text-xs text-gray-600">Müşteriler SancakBot'a mesaj atabilir</p>
          </div>

          {/* Yetenekler */}
          <div className="rounded-lg bg-white border border-violet-100 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-700 mb-2.5">Yetenekleri</p>
            <div className="space-y-1.5 text-xs text-gray-700">
              <div className="flex gap-2">
                <span className="shrink-0">📍</span>
                <span><strong>Konumalanı Paylaşma</strong> — Dükkânın adresini gönder</span>
              </div>
              <div className="flex gap-2">
                <span className="shrink-0">🕐</span>
                <span><strong>Açılış Saatleri</strong> — Şimdi açık mı, ne zaman açılacak</span>
              </div>
              <div className="flex gap-2">
                <span className="shrink-0">📊</span>
                <span><strong>Stok Kontrolü</strong> — Araç bulunup bulunmadığını sor</span>
              </div>
              <div className="flex gap-2">
                <span className="shrink-0">💳</span>
                <span><strong>Taksit Bilgisi</strong> — Ödeme planlarını açıkla</span>
              </div>
              <div className="flex gap-2">
                <span className="shrink-0">💰</span>
                <span><strong>Kapora/Rezervasyon</strong> — Kapora için elemanlara yönlendir</span>
              </div>
              <div className="flex gap-2">
                <span className="shrink-0">❓</span>
                <span><strong>Akıllı Sorular</strong> — Claude AI, müşteri sorularını yanıtlayabilir</span>
              </div>
            </div>
          </div>

          {/* Sistem Bilgisi */}
          <div className="rounded-lg bg-gradient-to-r from-violet-100 to-violet-50 border border-violet-200 p-3">
            <p className="text-[10px] font-semibold text-violet-700">
              ✨ SancakBot, müşteri servisinde yapılan işlerin önemli bir kısmını otomatikleştirerek takımı desteğiyle çalışır. AI her soruya cevap verir, gerekirse elemanlara yönlendirir.
            </p>
          </div>
        </div>
      </div>

      {/* Bilgi notu */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Round-robin nasıl çalışır?</strong> Her WhatsApp butonuna tıklandığında, aktif numaralar arasında sırayla seçim yapılır. Pasife alınan numara atlenir.
        </p>
      </div>
    </div>
  );
}
