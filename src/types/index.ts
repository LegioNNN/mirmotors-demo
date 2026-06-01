export type CarSegment = "Kelepir" | "Orta Direk" | "Premium" | "Yayla Kan";

export type CarStatus = "Aktif" | "Opsiyonlu" | "Satıldı";

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

export type LeadStatus = "Bekliyor" | "Kabul Edildi" | "Reddedildi";

export interface LeadBuying {
  id: string;
  customer_name: string;
  phone: string;
  brand: string;
  model: string;
  year: number;
  expected_price: number;
  status: LeadStatus;
}

