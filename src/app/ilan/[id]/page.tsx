import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Car } from "@/types";
import CarDetailClient from "./CarDetailClient";

export const revalidate = 0;

/* -------------------------------------------------------------------------- */
/*  Server Component - Supabase'den veri ceker, client bilesene gonderir      */
/* -------------------------------------------------------------------------- */

interface Props {
  params: Promise<{ id: string }>;
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
