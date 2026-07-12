"use client";

import { useState } from "react";
import { brand } from "@/config/brand";

const ADMIN_PASSWORD = brand.adminPassword;
const AUTH_KEY = brand.adminAuthKey;

interface AdminAuthScreenProps {
  onAuth: () => void;
}

export default function AdminAuthScreen({ onAuth }: AdminAuthScreenProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, "true");
      setError("");
      setPassword("");
      onAuth();
    } else {
      setError("Şifre hatalı.");
    }
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center px-4"
      style={{ backgroundImage: "url('/bg.png')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl">
          {/* Logo */}
          <div className="mb-7 flex flex-col items-center gap-3">
            <img src={brand.logos.horizontalDark} alt={brand.name} className="h-12 w-auto" />
            <div className="h-px w-full bg-white/10" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400/80">
              Yönetim Paneli
            </p>
          </div>

          {/* Şifre input */}
          <div className="space-y-3">
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Şifre
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                autoFocus
              />
            </div>

            {error && <p className="text-xs font-medium text-red-400">{error}</p>}

            <button
              type="button"
              onClick={handleLogin}
              disabled={!password.trim()}
              className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Giriş Yap
            </button>
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] text-gray-500">
          Yetkisiz erişim yasaktır.
        </p>
      </div>
    </main>
  );
}
