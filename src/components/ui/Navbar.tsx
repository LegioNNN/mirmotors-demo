"use client";

import { useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Navbar – Borusan Next tarzı                                              */
/* -------------------------------------------------------------------------- */

const navLinks = [
  { label: "Vitrin", href: "#vitrin" },
  { label: "Aracını Sat", href: "#sat" },
  { label: "Hakkımızda", href: "#hakkimizda" },
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
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Sol – Logo */}
        <button
          onClick={() => onTabChange("vitrin")}
          className="text-xl font-black tracking-tight text-[#111827] select-none"
        >
          SANCAKTAR
        </button>

        {/* Orta – Linkler (masaüstü) */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const isActive =
              (link.label === "Vitrin" && activeTab === "vitrin") ||
              (link.label === "Aracını Sat" && activeTab === "sat");
            return (
              <button
                key={link.label}
                onClick={() => {
                  if (link.label === "Vitrin") onTabChange("vitrin");
                  if (link.label === "Aracını Sat") onTabChange("sat");
                  setMobileOpen(false);
                }}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[#111827] font-bold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Sağ – Butonlar (masaüstü) */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Giriş
          </button>
          <button
            type="button"
            onClick={() => onTabChange("sat")}
            className="rounded-lg bg-green-700 px-4 py-1.5 text-sm font-bold text-white transition-colors hover:bg-green-600"
          >
            İlan Ver
          </button>
        </div>

        {/* Mobil hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden"
          aria-label="Menü"
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

      {/* Mobil menü */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 md:hidden">
          {navLinks.map((link) => {
            const isActive =
              (link.label === "Vitrin" && activeTab === "vitrin") ||
              (link.label === "Aracını Sat" && activeTab === "sat");
            return (
              <button
                key={link.label}
                onClick={() => {
                  if (link.label === "Vitrin") onTabChange("vitrin");
                  if (link.label === "Aracını Sat") onTabChange("sat");
                  setMobileOpen(false);
                }}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 text-[#111827] font-bold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {link.label}
              </button>
            );
          })}
          <hr className="my-2 border-gray-100" />
          <button
            type="button"
            className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-500 hover:text-gray-800"
          >
            Giriş
          </button>
          <button
            type="button"
            onClick={() => {
              onTabChange("sat");
              setMobileOpen(false);
            }}
            className="mt-1 block w-full rounded-lg bg-green-700 px-3 py-2 text-left text-sm font-bold text-white"
          >
            İlan Ver
          </button>
        </div>
      )}
    </nav>
  );
}
