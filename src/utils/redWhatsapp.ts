/**
 * "Nazikçe Reddet" aksiyonu için WhatsApp URL'i üretir.
 * Müşterinin aracını almama kararı sonrası otomatik şablon gönderir.
 *
 * @returns WhatsApp URL'i (yeni sekmede açılacak)
 */
import { brand as b } from "@/config/brand";

export function generateRedWhatsappUrl(
  customerPhone: string,
  brand: string,
  model: string,
  year: number
): string {
  const message = encodeURIComponent(
    `${b.name} olarak teklifiniz için teşekkür ederiz. Yapılan piyasa ve stok değerlendirmesi sonucunda, ${brand} ${model} ${year} aracınız şu anki güncel alım konseptimize uygun bulunmamıştır. Hayırlı satışlar dileriz.`
  );

  const cleaned = customerPhone.replace(/^\+/, "").replace(/[^0-9]/g, "");
  return `https://wa.me/${cleaned}?text=${message}`;
}
