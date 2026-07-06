import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Car } from "@/types";
import { brand } from "@/config/brand";
import CarDetailClient from "./CarDetailClient";

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data: car } = await supabase.from("cars").select("brand,model,year,price,images,km").eq("id", id).single();

  if (!car) return { title: "İlan Bulunamadı" };

  const title = `${car.brand} ${car.model} ${car.year} — ${brand.shortName}`;
  const price = new Intl.NumberFormat("tr-TR").format(car.price);
  const km = car.km ? `${new Intl.NumberFormat("tr-TR").format(car.km)} km` : "";
  const description = `${car.year} ${car.brand} ${car.model}${km ? `, ${km}` : ""}, ${price} ₺. ${brand.city} ${brand.district}'de ${brand.name}'den satılık.`;
  const image = car.images?.[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "tr_TR",
      siteName: brand.name,
      ...(image ? { images: [{ url: image, width: 1200, height: 800, alt: title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function CarDetailPage({ params }: Props) {
  const { id } = await params;

  const { data: car, error } = await supabase
    .from("cars")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !car) {
    notFound();
  }

  return <CarDetailClient car={car as Car} />;
}
