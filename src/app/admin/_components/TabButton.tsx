"use client";

import type { AdminTab } from "../types";

interface TabButtonProps {
  label: string;
  tabKey: AdminTab;
  activeTab: AdminTab;
  setActiveTab: (t: AdminTab) => void;
}

export default function TabButton({ label, tabKey, activeTab, setActiveTab }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={() => setActiveTab(tabKey)}
      className={`rounded-lg px-4 py-2.5 text-center text-sm font-bold transition-all ${
        activeTab === tabKey
          ? "bg-[#111827] text-white shadow-sm"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}
