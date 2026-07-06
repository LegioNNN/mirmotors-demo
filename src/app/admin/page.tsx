"use client";

import { useState, useEffect } from "react";
import AdminShell from "./_components/AdminShell";
import AdminAuthScreen from "./_components/AdminAuthScreen";
import { brand } from "@/config/brand";

const AUTH_KEY = brand.adminAuthKey;

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored === "true") {
      setAuthenticated(true);
    }
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f9fafb]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />
      </main>
    );
  }

  if (!authenticated) {
    return <AdminAuthScreen onAuth={() => setAuthenticated(true)} />;
  }

  return <AdminShell onLogout={() => setAuthenticated(false)} />;
}
