"use client";

import { useState } from "react";

const ADMIN_PASSWORD = "sancaktar2026";
const AUTH_KEY = "sancaktar_admin_auth";

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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#111827] to-[#1a2332] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-gray-800 bg-white/5 p-8 backdrop-blur-sm">
          {/* Logo / Başlık */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-600 shadow-lg">
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
                <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
                <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <h1 className="text-lg font-black tracking-tight text-white">
              Sancaktar Yönetim
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Devam etmek için şifre girin.
            </p>
          </div>

          {/* Şifre input */}
          <div className="space-y-3">
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Şifre
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin();
                }}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-700 bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                autoFocus
              />
            </div>

            {/* Hata mesajı */}
            {error && <p className="text-xs font-medium text-red-400">{error}</p>}

            {/* Giriş butonu */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={!password.trim()}
              className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-700/20 transition-all duration-200 hover:bg-emerald-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
            >
              Giriş Yap
            </button>
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] text-gray-600">
          Yetkisiz erişim yasaktır.
        </p>
      </div>
    </main>
  );
}
