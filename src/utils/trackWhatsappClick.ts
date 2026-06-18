import { supabase } from "@/lib/supabase";

/* -------------------------------------------------------------------------- */
/*  WhatsApp Click Tracking Helper                                           */
/*  Kayıt başarısız olursa sadece console.error basar, yönlendirmeyi engellemez */
/* -------------------------------------------------------------------------- */

export interface TrackWhatsappClickParams {
  car_id: string;
  car_brand: string;
  car_model: string;
  car_year: number;
  car_price: number;
  source: "car_card" | "vehicle_detail_sidebar" | "vehicle_detail_mobile";
  phone_target: string;
  message: string;
}

export async function trackWhatsappClick(params: TrackWhatsappClickParams): Promise<void> {
  try {
    const { error } = await supabase.from("whatsapp_clicks").insert({
      car_id: params.car_id,
      car_brand: params.car_brand,
      car_model: params.car_model,
      car_year: params.car_year,
      car_price: params.car_price,
      source: params.source,
      phone_target: params.phone_target,
      message: params.message,
    });

    if (error) {
      console.error("WhatsApp click tracking error:", error.message);
    }
  } catch (err) {
    console.error("WhatsApp click tracking exception:", err);
  }
}
