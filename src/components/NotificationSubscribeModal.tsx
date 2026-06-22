"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotificationSubscribeModal({ open, onClose }: Props) {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!value.trim()) {
      setError(method === "email" ? "E-posta adresi gerekli" : "WhatsApp numarası gerekli");
      setLoading(false);
      return;
    }

    try {
      const data = method === "email" ? { email: value } : { phone: value };
      const { error: err } = await supabase
        .from("notifications_subscriptions")
        .insert([data]);

      if (err) {
        if (err.message.includes("duplicate")) {
          setError(method === "email" ? "Bu e-posta zaten kayıtlı" : "Bu numara zaten kayıtlı");
        } else {
          setError(err.message);
        }
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setValue("");
          setMethod("email");
        }, 2000);
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="px-6 py-6">
          {/* Başlık */}
          <h2 className="text-xl font-black text-[#111827]">Yeni Araçlardan Haberdar Ol</h2>
          <p className="mt-2 text-sm text-gray-500">Yeni araçlar eklendiğinde seni bilgilendireceğiz.</p>

          {success ? (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm font-semibold text-green-700">✓ Başarıyla kaydedildi!</p>
              <p className="mt-1 text-xs text-green-600">Yeni araçlar için bildirim almaya başlayacaksın.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Seçim butonları */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMethod("email")}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                    method === "email"
                      ? "bg-[#111827] text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  📧 E-Posta
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("phone")}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                    method === "phone"
                      ? "bg-[#111827] text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  📱 WhatsApp
                </button>
              </div>

              {/* Input */}
              <div>
                <input
                  type={method === "email" ? "email" : "tel"}
                  value={value}
                  onChange={(e) => { setValue(e.target.value); setError(null); }}
                  placeholder={method === "email" ? "ornek@email.com" : "5XX XXX XX XX"}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-[#111827]/10"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-xs font-semibold text-red-600">{error}</p>
                </div>
              )}

              {/* Butonlar */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-[#111827] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          )}

          {/* Kapat X */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
