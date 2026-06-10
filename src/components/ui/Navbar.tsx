"use client";

import { useState } from "react";

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

        {/* Sag – Butonlar (masaustu) */}
        <div className="hidden items-center gap-2.5 md:flex">
          <button
            type="button"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 active:scale-[0.97]"
          >
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 1 0-16 0" />
              </svg>
              Giris
            </span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange("sat")}
            className="rounded-lg bg-gradient-to-r from-green-800 to-green-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:from-green-700 hover:to-green-600 hover:shadow-md active:scale-[0.97]"
          >
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Ilan Ver
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
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 1 0-16 0" />
            </svg>
            Giris
          </button>
          <button
            type="button"
            onClick={() => {
              onTabChange("sat");
              setMobileOpen(false);
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-lg bg-gradient-to-r from-green-800 to-green-700 px-3 py-2.5 text-left text-sm font-bold text-white"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Ilan Ver
          </button>
        </div>
      )}
    </nav>
  );
}
