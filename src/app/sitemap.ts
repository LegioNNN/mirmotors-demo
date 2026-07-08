import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { brand } from "@/config/brand";

const BASE = `https://${brand.shortName.toLowerCase()}.com`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let cars: { id: string; created_at: string }[] = [];
  try {
    const { data } = await supabase
      .from("cars")
      .select("id, created_at")
      .eq("status", "Aktif")
      .order("created_at", { ascending: false })
      .limit(500);
    cars = data ?? [];
  } catch {
    cars = [];
  }

  const carUrls: MetadataRoute.Sitemap = cars.map((c) => ({
    url: `${BASE}/ilan/${c.id}`,
    lastModified: new Date(c.created_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...carUrls,
  ];
}
