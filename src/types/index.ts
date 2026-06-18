export type CarSegment = "Kelepir" | "Orta Direk" | "Premium" | "Yayla Kan";

export type CarStatus = "Aktif" | "Kaporalandı" | "Satıldı" | "Yayından Kaldırıldı";

/** UI'da gösterilecek durum etiketi - eski "Opsiyonlu" kayıtları da kapsar */
export function displayStatus(status: string): string {
  if (status === "Opsiyonlu" || status === "Kaporalandı") return "Kaporalandı";
  return status;
}

export type FuelType = "Benzin" | "Dizel" | "Elektrik" | "Hibrit" | "LPG";
export type Transmission = "Manuel" | "Otomatik" | "Yarı Otomatik";

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  price: number;
  images: string[];
  video_url?: string;
  esnaf_notu?: string;
  segment: CarSegment;
  status: CarStatus;
  is_featured?: boolean;
  is_hero?: boolean;
  ekspertiz_durumu?: string;
  fuel_type: FuelType;
  transmission: Transmission;
  created_at: string;
}

export interface WhatsappNumber {
  id: string;
  phone_number: string;
  employee_name: string;
  is_active: boolean;
}

export type LeadStatus = "Bekliyor" | "Arandı" | "Ulaşılamadı" | "Tekrar Aranacak" | "Kabul Edildi" | "Reddedildi" | "Alım Yapıldı";

export interface LeadBuying {
  id: string;
  customer_name: string;
  phone: string;
  brand: string;
  model: string;
  year: number;
  expected_price: number;
  status: LeadStatus;
  km?: string | null;
  damage_note?: string | null;
  has_tramer?: boolean;
  wants_trade?: boolean;
  extra_note?: string | null;
  city?: string | null;
  district?: string | null;
  contact_preference?: string;
  kvkk_accepted?: boolean;
  admin_note?: string | null;
  follow_up_at?: string | null;
  photo_urls?: string[] | null;
}

