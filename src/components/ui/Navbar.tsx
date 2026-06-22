"use client";

import { useState } from "react";
import { createKaporaLink } from "@/utils/whatsappBalancer";

export default function Navbar({
  activeTab,
  onTabChange,
  onNotificationClick,
}: {
  activeTab: string;
  onTabChange: (tab: "vitrin" | "sat") => void;
  onNotificationClick?: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleWhatsapp = async () => {
    const result = await createKaporaLink("", "", new Date().getFullYear());
    if (result) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <button
            onClick={() => { onTabChange("vitrin"); setMobileOpen(false); }}
            className="flex items-center gap-3 select-none"
          >
            <img src="/sancaktar-logo-yatay.svg" alt="Sancaktar Otomotiv" className="h-9 w-auto" />
          </button>

          {/* Orta linkler — masaüstü */}
          <div className="hidden items-center gap-1 md:flex">
            <NavBtn
              active={activeTab === "vitrin"}
              onClick={() => onTabChange("vitrin")}
            >
              Vitrin
            </NavBtn>
            <NavBtn
              active={activeTab === "sat"}
              onClick={() => onTabChange("sat")}
            >
              Aracını Sat
            </NavBtn>
            <NavBtn active={false} onClick={() => scrollTo("hakkimizda")}>
              Hakkımızda
            </NavBtn>
          </div>

          {/* Sağ — masaüstü */}
          <div className="hidden items-center gap-3 md:flex">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsapp}
              className="flex items-center gap-2 rounded-lg bg-[#25D366] px-3.5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </button>

            {/* Araç sat */}
            <button
              type="button"
              onClick={() => onTabChange("sat")}
              className="rounded-lg bg-[#111827] px-3.5 py-2 text-sm font-bold text-white transition-colors hover:bg-gray-800"
            >
              Aracını Bize Sat
            </button>
          </div>

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 md:hidden"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobil menü */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-3 md:hidden">
          <div className="flex flex-col gap-1">
            <MobileNavBtn active={activeTab === "vitrin"} onClick={() => { onTabChange("vitrin"); setMobileOpen(false); }}>
              Vitrin
            </MobileNavBtn>
            <MobileNavBtn active={activeTab === "sat"} onClick={() => { onTabChange("sat"); setMobileOpen(false); }}>
              Aracını Sat
            </MobileNavBtn>
            <MobileNavBtn active={false} onClick={() => scrollTo("hakkimizda")}>
              Hakkımızda
            </MobileNavBtn>
          </div>

          {/* Banner */}
          <div className="mt-4 rounded-lg border border-blue-200 bg-gradient-to-b from-blue-50 to-blue-50/50 p-3 space-y-2">
            <div>
              <p className="text-[10px] font-semibold uppercase text-blue-700">📢 Bildir</p>
              <p className="mt-0.5 text-xs font-black text-[#111827]">Yeni araçlar eklendiğinde</p>
              <p className="text-[11px] text-gray-600">sana haber verebiliriz!</p>
            </div>
            <button
              type="button"
              onClick={() => { onNotificationClick?.(); setMobileOpen(false); }}
              className="w-full rounded-lg bg-blue-600 py-2 text-xs font-bold text-white"
            >
              Abone Ol
            </button>
          </div>

        </div>
      )}
    </nav>
  );
}

function NavBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-[#111827] text-white font-semibold"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

function MobileNavBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
        active
          ? "bg-gray-100 text-[#111827] font-semibold"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}
