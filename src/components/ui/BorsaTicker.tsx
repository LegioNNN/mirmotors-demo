"use client";

import { useEffect, useState, useRef } from "react";

interface TickerItem {
  label: string;
  value: number;
  format?: "number" | "currency";
  emoji?: string;
}

const defaultStats: TickerItem[] = [
  { label: "Son 48 Saatte Satılan Araç", value: 47, emoji: "🔥" },
  { label: "Galerideki Güncel Stok", value: 18, emoji: "🚘" },
  { label: "Aktif İnceleme", value: 1420, format: "number", emoji: "👁️" },
  { label: "Bugün Gelen Fırsat", value: 6, emoji: "💥" },
  { label: "Memnun Müşteri", value: 2850, emoji: "⭐" },
];

const formatValue = (item: TickerItem): string => {
  const n = item.value;
  if (item.format === "currency") {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(n);
  }
  return new Intl.NumberFormat("tr-TR").format(n);
};

export default function BorsaTicker({ stats }: { stats?: TickerItem[] }) {
  const items = stats ?? defaultStats;
  const [mounted, setMounted] = useState(false);
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    setTickerItems([...items]);
    intervalRef.current = setInterval(() => {
      setTickerItems((prev) =>
        prev.map((t) => {
          const delta = Math.random() > 0.55 ? Math.floor(Math.random() * 3) + 1 : 0;
          const sign = Math.random() > 0.5 ? 1 : -1;
          return { ...t, value: Math.max(0, t.value + delta * sign) };
        })
      );
    }, 10_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full overflow-hidden border-b border-gray-200 bg-white select-none">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent" />
      <div className="flex animate-scroll items-center gap-8 py-2.5 text-sm whitespace-nowrap">
        {tickerItems.map((t, idx) => (
          <TickerBadge key={`a-${idx}`} item={t} />
        ))}
        {tickerItems.map((t, idx) => (
          <TickerBadge key={`b-${idx}`} item={t} />
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll { animation: scroll 48s linear infinite; }
      `}</style>
    </div>
  );
}

function TickerBadge({ item }: { item: TickerItem }) {
  const isUp = Math.random() > 0.5;
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gray-50 border border-gray-100 px-3 py-1 text-gray-700">
      {item.emoji && <span className="text-sm leading-none">{item.emoji}</span>}
      <span className="text-[11px] tracking-tight text-gray-500 font-medium uppercase">{item.label}</span>
      <span className="text-gray-200">|</span>
      <span className="font-mono font-bold text-gray-900 tabular-nums tracking-tight">{formatValue(item)}</span>
      <span className={`text-xs font-bold leading-none ${isUp ? "text-green-600" : "text-red-500"}`}>
        {isUp ? "▲" : "▼"}
      </span>
    </span>
  );
}
