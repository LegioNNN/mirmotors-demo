import type { WhatsappNumber } from "@/types";

/* -------------------------------------------------------------------------- */
/*  Personel Havuzu – Mock                                                    */
/* -------------------------------------------------------------------------- */

const personnelPool: WhatsappNumber[] = [
  {
    id: "EMP-001",
    phone_number: "905301234567",
    employee_name: "Ahmet Sancaktar",
    is_active: true,
  },
  {
    id: "EMP-002",
    phone_number: "905321234568",
    employee_name: "Mehmet Yılmaz",
    is_active: true,
  },
  {
    id: "EMP-003",
    phone_number: "905331234569",
    employee_name: "Ali Demir",
    is_active: true,
  },
  {
    id: "EMP-004",
    phone_number: "905341234570",
    employee_name: "Can Kara",
    is_active: false,
  },
];

/* -------------------------------------------------------------------------- */
/*  Round-Robin sayaç                                                        */
/* -------------------------------------------------------------------------- */

let roundRobinIndex = 0;

/* -------------------------------------------------------------------------- */
/*  Seçici: Aktif personel havuzundan sıradaki numarayı döndür              */
/* -------------------------------------------------------------------------- */

/**
 * Havuzdaki aktif personeller arasından sırayla (Round-Robin) seçim yapar.
 * @param mode "round-robin" (varsayılan) veya "random"
 * @returns Seçilen aktif WhatsappNumber veya null (hiç aktif personel yoksa)
 */
export function selectPersonnel(
  mode: "round-robin" | "random" = "round-robin"
): WhatsappNumber | null {
  const active = personnelPool.filter((p) => p.is_active);

  if (active.length === 0) return null;

  if (mode === "random") {
    const idx = Math.floor(Math.random() * active.length);
    return active[idx];
  }

  // Round-Robin
  const selected = active[roundRobinIndex % active.length];
  roundRobinIndex = (roundRobinIndex + 1) % active.length;
  return selected;
}

/* -------------------------------------------------------------------------- */
/*  WhatsApp URL üreteci                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Seçilen personel ve araç bilgileriyle WhatsApp mesaj şablonu oluşturur.
 * Örnek çıktı: https://wa.me/905301234567?text=Selamın...
 */
export function generateWhatsAppUrl(
  phoneNumber: string,
  brand: string,
  model: string,
  year: number
): string {
  const message = encodeURIComponent(
    `Selamın aleyküm Sancaktar Otomotiv, sitenizdeki ${brand} ${model} ${year} ilanı için kapora gönderip aracı ayırtmak istiyorum. Hesap numarası alabilir miyim?`
  );

  // Uluslararası format: başında + yok, 9053XXXXXXXX
  const cleaned = phoneNumber.replace(/^\+/, "").replace(/[^0-9]/g, "");
  return `https://wa.me/${cleaned}?text=${message}`;
}

/* -------------------------------------------------------------------------- */
/*  Tek adımda: personel seç + URL oluştur                                   */
/* -------------------------------------------------------------------------- */

/**
 * Bir araç için tek hamlede WhatsApp linki üretir.
 * @returns [url, employeeName] veya null
 */
export function createKaporaLink(
  brand: string,
  model: string,
  year: number,
  mode: "round-robin" | "random" = "round-robin"
): { url: string; employeeName: string } | null {
  const person = selectPersonnel(mode);
  if (!person) return null;

  const url = generateWhatsAppUrl(person.phone_number, brand, model, year);
  return { url, employeeName: person.employee_name };
}
