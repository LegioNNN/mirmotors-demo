"use client";

import { useState, type FormEvent } from "react";
import type { LeadBuying } from "@/types";

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

interface AracSatFormuProps {
  onSubmit: (lead: LeadBuying) => void;
}

/* -------------------------------------------------------------------------- */
/*  Form state tipi                                                           */
/* -------------------------------------------------------------------------- */

interface FormState {
  customer_name: string;
  phone: string;
  brand: string;
  model: string;
  year: string;
  km: string;
  hasar_durumu: string;
  expected_price: string;
}

const emptyForm: FormState = {
  customer_name: "",
  phone: "",
  brand: "",
  model: "",
  year: "",
  km: "",
  hasar_durumu: "",
  expected_price: "",
};

/* -------------------------------------------------------------------------- */
/*  Yardımcı – ID üretici                                                    */
/* -------------------------------------------------------------------------- */

let _counter = 0;
const genId = () => {
  _counter += 1;
  const ts = Date.now().toString(36).toUpperCase();
  return `LEAD-${ts}-${String(_counter).padStart(3, "0")}`;
};

/* -------------------------------------------------------------------------- */
/*  Bileşen – Borusan Next light form                                        */
/* -------------------------------------------------------------------------- */

export default function AracSatFormu({ onSubmit }: AracSatFormuProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const errs: typeof errors = {};

    if (!form.customer_name.trim()) errs.customer_name = "Ad Soyad gerekli";
    if (!form.phone.trim()) errs.phone = "Telefon gerekli";
    else if (!/^[+]?[0-9\s()-]{7,18}$/.test(form.phone.trim()))
      errs.phone = "Geçerli bir telefon numarası girin";

    if (!form.brand.trim()) errs.brand = "Marka gerekli";
    if (!form.model.trim()) errs.model = "Model gerekli";

    const yil = Number(form.year);
    if (!form.year.trim()) errs.year = "Yıl gerekli";
    else if (yil < 1980 || yil > new Date().getFullYear() + 1 || isNaN(yil))
      errs.year = "Geçerli bir yıl girin (1980 – günümüz)";

    const fiyat = Number(form.expected_price.replace(/[^0-9]/g, ""));
    if (!form.expected_price.trim()) errs.expected_price = "Beklenen fiyat gerekli";
    else if (fiyat < 1000 || isNaN(fiyat))
      errs.expected_price = "En az 1.000 ₺ girin";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const lead: LeadBuying = {
      id: genId(),
      customer_name: form.customer_name.trim(),
      phone: form.phone.trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      expected_price: Number(form.expected_price.replace(/[^0-9]/g, "")),
      status: "Bekliyor",
    };

    onSubmit(lead);
    setForm(emptyForm);
    setErrors({});
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  };

  const set = (field: keyof FormState) => (val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePhone = (v: string) => {
    const cleaned = v.replace(/[^0-9+]/g, "");
    set("phone")(cleaned.length > 15 ? form.phone : cleaned);
  };

  const handlePrice = (v: string) => {
    const digits = v.replace(/[^0-9]/g, "");
    set("expected_price")(digits);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-bold text-[#111827]">Aracını Sancaktar&apos;a Sat</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Formu doldurun, ekibimiz en kısa sürede size dönüş yapacak.
        </p>
      </div>

      {submitted && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Talebiniz başarıyla alındı. Ekibimiz sizinle iletişime geçecek.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Ad Soyad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.customer_name}
              onChange={(e) => set("customer_name")(e.target.value)}
              placeholder="Adınız Soyadınız"
              className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#111827] placeholder-gray-400 outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-gray-300 ${
                errors.customer_name ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.customer_name && (
              <p className="mt-0.5 text-[11px] text-red-500">{errors.customer_name}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Telefon <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handlePhone(e.target.value)}
              placeholder="+90530 XXX XX XX"
              className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#111827] placeholder-gray-400 outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-gray-300 ${
                errors.phone ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.phone && (
              <p className="mt-0.5 text-[11px] text-red-500">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Marka <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => set("brand")(e.target.value)}
              placeholder="Örn: Renault"
              className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#111827] placeholder-gray-400 outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-gray-300 ${
                errors.brand ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.brand && (
              <p className="mt-0.5 text-[11px] text-red-500">{errors.brand}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.model}
              onChange={(e) => set("model")(e.target.value)}
              placeholder="Örn: Clio 4 Joy 1.2"
              className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#111827] placeholder-gray-400 outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-gray-300 ${
                errors.model ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.model && (
              <p className="mt-0.5 text-[11px] text-red-500">{errors.model}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Yıl <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1980}
              max={new Date().getFullYear() + 1}
              value={form.year}
              onChange={(e) => set("year")(e.target.value)}
              placeholder="2020"
              className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#111827] placeholder-gray-400 outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-gray-300 ${
                errors.year ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.year && (
              <p className="mt-0.5 text-[11px] text-red-500">{errors.year}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Kilometre
            </label>
            <input
              type="text"
              value={form.km}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "");
                set("km")(v);
              }}
              placeholder="142.000"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#111827] placeholder-gray-400 outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-gray-300"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Hasar Kaydı / Durumu
            </label>
            <input
              type="text"
              value={form.hasar_durumu}
              onChange={(e) => set("hasar_durumu")(e.target.value)}
              placeholder="Örn: Boyasız, 2 parça boyalı, değişen yok..."
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#111827] placeholder-gray-400 outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-gray-300"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Beklenen Fiyat (₺) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={form.expected_price ? Number(form.expected_price).toLocaleString("tr-TR") : ""}
                onChange={(e) => handlePrice(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="495.000"
                className={`w-full rounded-lg border bg-white px-3 py-2 pl-8 text-sm text-[#111827] placeholder-gray-400 outline-none transition-colors focus:border-[#111827] focus:ring-1 focus:ring-gray-300 ${
                  errors.expected_price ? "border-red-300" : "border-gray-200"
                }`}
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                ₺
              </span>
            </div>
            {errors.expected_price && (
              <p className="mt-0.5 text-[11px] text-red-500">{errors.expected_price}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="mt-5 w-full rounded-lg bg-[#111827] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
        >
          Aracımı Satmak İstiyorum
        </button>
      </form>
    </div>
  );
}
