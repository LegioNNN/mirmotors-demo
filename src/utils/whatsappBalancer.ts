import type { WhatsappNumber } from "@/types";
import { supabase } from "@/lib/supabase";
import { brand as brandConfig } from "@/config/brand";

/* -------------------------------------------------------------------------- */
/*  Supabase'den aktif personel havuzunu çek                                 */
/* -------------------------------------------------------------------------- */

let cachedPersonnel: WhatsappNumber[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 60_000;

async function getActivePersonnel(): Promise<WhatsappNumber[]> {
  const now = Date.now();
  if (cachedPersonnel && now - lastFetch < CACHE_TTL) {
    return cachedPersonnel;
  }

  const { data, error } = await supabase
    .from("whatsapp_numbers")
    .select("*")
    .eq("is_active", true);

  if (error) {
    console.error("WhatsApp personel yüklenemedi:", error.message);
    return [];
  }

  cachedPersonnel = (data as WhatsappNumber[]) ?? [];
  lastFetch = now;
  return cachedPersonnel;
}

/* -------------------------------------------------------------------------- */
/*  Round-Robin                                                               */
/* -------------------------------------------------------------------------- */

let roundRobinIndex = 0;

export async function selectPersonnel(
  mode: "round-robin" | "random" = "round-robin"
): Promise<WhatsappNumber | null> {
  const active = await getActivePersonnel();
  if (active.length === 0) return null;

  if (mode === "random") {
    return active[Math.floor(Math.random() * active.length)];
  }

  const selected = active[roundRobinIndex % active.length];
  roundRobinIndex = (roundRobinIndex + 1) % active.length;
  return selected;
}

/* -------------------------------------------------------------------------- */
/*  WhatsApp URL üreteci                                                      */
/* -------------------------------------------------------------------------- */

export function generateWhatsAppUrl(
  phoneNumber: string,
  brand: string,
  model: string,
  year: number
): string {
  const message = encodeURIComponent(
    `Merhaba ${brandConfig.name}, sitenizdeki ${brand} ${model} ${year} ilanıyla ilgileniyorum.`
  );
  const cleaned = phoneNumber.replace(/^\+/, "").replace(/[^0-9]/g, "");
  return `https://wa.me/${cleaned}?text=${message}`;
}

/* -------------------------------------------------------------------------- */
/*  Tek adımda: personel seç + URL                                           */
/* -------------------------------------------------------------------------- */

export async function createKaporaLink(
  brand: string,
  model: string,
  year: number,
  mode: "round-robin" | "random" = "round-robin"
): Promise<{ url: string; employeeName: string } | null> {
  const person = await selectPersonnel(mode);
  if (!person) return null;
  const url = generateWhatsAppUrl(person.phone_number, brand, model, year);
  return { url, employeeName: person.employee_name };
}
