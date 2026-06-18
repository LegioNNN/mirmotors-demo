"use client";

import { useState } from "react";
import { createKaporaLink } from "@/utils/whatsappBalancer";

/* -------------------------------------------------------------------------- */
/*  Navbar – Premium Oto Galeri                                              */
/* -------------------------------------------------------------------------- */

const navLinks = [
  { label: "Vitrin", href: "#vitrin" },
  { label: "Aracini Sat", href: "#sat" },
  { label: "Hakkimizda", href: "#hakkimizda" },
];

export default function Navbar({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: "vitrin" | "sat") => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleWhatsapp = async () => {
    const result = await createKaporaLink("", "", new Date().getFullYear());
    if (result) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    } else {
      alert("Şu anda tüm personelimiz yoğun.");
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Sol – Logo */}
        <button
          onClick={() => onTabChange("vitrin")}
          className="group flex items-center gap-2.5 select-none"
        >
          {/* Logo ikonu */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#111827] to-gray-800 shadow-sm transition-all group-hover:shadow-md">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
              <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
              <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
            </svg>
          </div>
          {/* Logo yazisi */}
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-black tracking-tight text-[#111827]">SANCAKTAR</span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400">Otomotiv</span>
          </div>
        </button>

        {/* Orta – Linkler (masaustu) */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive =
              (link.label === "Vitrin" && activeTab === "vitrin") ||
              (link.label === "Aracini Sat" && activeTab === "sat");
            return (
              <button
                key={link.label}
                onClick={() => {
                  if (link.label === "Vitrin") onTabChange("vitrin");
                  if (link.label === "Aracini Sat") onTabChange("sat");
                  if (link.label === "Hakkimizda") {
                    const el = document.getElementById("hakkimizda");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }
                  setMobileOpen(false);
                }}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gray-100 text-[#111827] font-bold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Sag – Premium Butonlar (masaustu) */}
        <div className="hidden items-center gap-2.5 md:flex">
          {/* WhatsApp Butonu */}
          <button
            type="button"
            onClick={handleWhatsapp}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-green-300 hover:bg-green-50 hover:text-green-700 active:scale-[0.97]"
          >
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </span>
          </button>

          {/* Aracını Bize Sat Butonu */}
          <button
            type="button"
            onClick={() => onTabChange("sat")}
            className="rounded-lg bg-gradient-to-r from-[#1a2332] to-[#111827] px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:from-[#111827] hover:to-gray-800 hover:shadow-md active:scale-[0.97]"
          >
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Aracını Bize Sat
            </span>
          </button>
        </div>

        {/* Mobil hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 md:hidden"
          aria-label="Menu"
        >
          {mobileOpen ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobil menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white/95 backdrop-blur-md px-4 pb-4 pt-2 md:hidden">
          {navLinks.map((link) => {
            const isActive =
              (link.label === "Vitrin" && activeTab === "vitrin") ||
              (link.label === "Aracini Sat" && activeTab === "sat");
            return (
              <button
                key={link.label}
                onClick={() => {
                  if (link.label === "Vitrin") onTabChange("vitrin");
                  if (link.label === "Aracini Sat") onTabChange("sat");
                  if (link.label === "Hakkimizda") {
                    const el = document.getElementById("hakkimizda");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }
                  setMobileOpen(false);
                }}
                className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 text-[#111827] font-bold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                {link.label}
              </button>
            );
          })}
          <hr className="my-2 border-gray-100" />
          {/* Mobil WhatsApp */}
          <button
            type="button"
            onClick={() => { handleWhatsapp(); setMobileOpen(false); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </button>
          {/* Mobil Aracını Bize Sat */}
          <button
            type="button"
            onClick={() => {
              onTabChange("sat");
              setMobileOpen(false);
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-lg bg-gradient-to-r from-[#1a2332] to-[#111827] px-3 py-2.5 text-left text-sm font-bold text-white"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Aracını Bize Sat
          </button>
        </div>
      )}
    </nav>
  );
}
