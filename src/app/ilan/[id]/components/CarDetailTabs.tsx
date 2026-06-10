"use client";

/* ======================================================================== */
/*  CarDetailTabs - Tab navigasyonu (Genel / Ekspertiz / Satici)            */
/* ======================================================================== */

export type DetailTab = "genel" | "ekspertiz" | "satici";

interface TabItem {
  key: DetailTab;
  label: string;
  icon: string;
}

const tabs: TabItem[] = [
  {
    key: "genel",
    label: "Genel Bakis",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    key: "ekspertiz",
    label: "Ekspertiz",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    key: "satici",
    label: "Satici",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
];

interface Props {
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
}

export default function CarDetailTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="flex border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
            activeTab === tab.key
              ? "border-[#111827] text-[#111827] font-bold"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d={tab.icon} />
          </svg>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
