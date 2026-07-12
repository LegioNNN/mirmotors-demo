"use client";

import { useState } from "react";

interface Props {
  url: string;
  title: string;
  variant?: "icon" | "full";
}

export default function ShareButton({ url, title, variant = "icon" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl });
        return;
      } catch {
        // kullanıcı iptal etti veya desteklenmiyor
      }
    }

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard erişim yok
    }
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleShare}
        title="Paylaş"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-[#111827]"
      >
        {copied ? (
          <svg className="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50 active:scale-[0.98]"
    >
      {copied ? (
        <>
          <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-emerald-600">Link Kopyalandı!</span>
        </>
      ) : (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Paylaş / Linki Kopyala
        </>
      )}
    </button>
  );
}
