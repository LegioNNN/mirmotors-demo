"use client";

import { useEffect, useState } from "react";
import { brand } from "@/config/brand";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstaller() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Service worker kayıt
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Daha önce reddettiyse gösterme
    const dismissed = localStorage.getItem("pwa-dismissed");
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      // 3 saniye bekle, sonra göster (sayfanın yüklenmesini bekle)
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => { setInstalled(true); setShow(false); });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setShow(false);
    setPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-dismissed", "1");
    setShow(false);
  };

  if (!show || installed) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[200] sm:right-auto sm:left-4 sm:w-80 animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl shadow-black/10">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#111827]">
            <img src={brand.logos.icon} alt={brand.shortName} className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#111827]">Uygulamayı Yükle</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {brand.shortName}'ı telefona ekle, araçlara anında ulaş.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 rounded-xl border border-gray-200 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Şimdi Değil
          </button>
          <button
            type="button"
            onClick={handleInstall}
            className="flex-1 rounded-xl bg-[#111827] py-2 text-xs font-bold text-white hover:bg-gray-800 transition-colors"
          >
            Yükle
          </button>
        </div>
      </div>
    </div>
  );
}
