import { supabase } from "@/lib/supabase";
import { brand } from "@/config/brand";

/* -------------------------------------------------------------------------- */
/*  Sayfa Görüntüleme Takibi                                                  */
/*  Kullanıcı her sayfa yüklediğinde çağrılır.                                */
/*  Tablo: page_views (id, path, referrer, user_agent, ip_hash, created_at)   */
/* -------------------------------------------------------------------------- */

export interface PageViewPayload {
  path: string;
  referrer: string;
}

export async function trackPageView(payload: PageViewPayload): Promise<void> {
  try {
    // IP hash için basit bir fingerprint
    const fp = await simpleFingerprint();
    const { error } = await supabase.from("page_views").insert({
      path: payload.path,
      referrer: payload.referrer || "",
      user_agent: navigator.userAgent?.slice(0, 255) || "",
      ip_hash: fp,
    });
    if (error) {
      console.error("page_view tracking error:", error.message);
    }
  } catch (err) {
    console.error("page_view tracking exception:", err);
  }
}

/* -------------------------------------------------------------------------- */
/*  Online Kullanıcı Kalp Atışı                                              */
/*  Her 60 saniyede bir "active_users" tablosuna upsert yapar.               */
/*  Session ID ile tekil kullanıcı takibi.                                    */
/*  Tablo: active_users (session_id, last_seen, path)                         */
/* -------------------------------------------------------------------------- */

const HEARTBEAT_INTERVAL = 60_000; // 1 dakika
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let currentSessionId: string | null = null;

function getSessionId(): string {
  if (currentSessionId) return currentSessionId;
  // LocalStorage'da session_id yoksa oluştur
  const storageKey = `${brand.shortName.toLowerCase()}_session_id`;
  let sid = localStorage.getItem(storageKey);
  if (!sid) {
    sid = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(storageKey, sid);
  }
  currentSessionId = sid;
  return sid;
}

async function sendHeartbeat(path: string) {
  try {
    const sid = getSessionId();
    await supabase.from("active_users").upsert(
      {
        session_id: sid,
        last_seen: new Date().toISOString(),
        path: path,
      },
      { onConflict: "session_id" }
    );
  } catch {
    // sessizce başarısız olabilir
  }
}

export function startHeartbeat(path: string) {
  stopHeartbeat();
  // İlk kalp atışını hemen gönder
  sendHeartbeat(path);
  // Ardından periyodik olarak
  heartbeatTimer = setInterval(() => sendHeartbeat(path), HEARTBEAT_INTERVAL);
}

export function stopHeartbeat() {
  if (heartbeatTimer !== null) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Aktif Online Kullanıcı Sayısını Çek                                      */
/*  Son N saniye içinde kalp atışı gönderen tekil session_id'ler.            */
/* -------------------------------------------------------------------------- */

export async function getOnlineUserCount(sinceSeconds = 120): Promise<number> {
  try {
    const since = new Date(Date.now() - sinceSeconds * 1000).toISOString();
    const { count, error } = await supabase
      .from("active_users")
      .select("*", { count: "exact", head: true })
      .gte("last_seen", since);

    if (error) {
      console.error("getOnlineUserCount error:", error.message);
      return 0;
    }
    return count ?? 0;
  } catch {
    return 0;
  }
}

/* -------------------------------------------------------------------------- */
/*  Bugün Siteyi Ziyaret Eden Tekil Kullanıcı Sayısı                         */
/* -------------------------------------------------------------------------- */

export async function getTodayVisitors(): Promise<number> {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count, error } = await supabase
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString());

    if (error) {
      console.error("getTodayVisitors error:", error.message);
      return 0;
    }
    return count ?? 0;
  } catch {
    return 0;
  }
}

/* -------------------------------------------------------------------------- */
/*  Basit Parmak İzi                                                         */
/* -------------------------------------------------------------------------- */

async function simpleFingerprint(): Promise<string> {
  try {
    // Tarayıcı destekliyorsa canvas fingerprint dene
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText(brand.shortName, 2, 15);
      return canvas.toDataURL().slice(0, 64);
    }
  } catch {
    // fallback
  }
  // Fallback
  return `${navigator.userAgent?.slice(0, 64)}-${screen.width}x${screen.height}`;
}
