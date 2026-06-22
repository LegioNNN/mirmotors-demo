import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { writeFileSync } from "fs";

const supabase = createClient(
  "https://zurhpytymwevhrclnszy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cmhweXR5bXdldmhyY2xuc3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNjA2NzEsImV4cCI6MjA5NTgzNjY3MX0.1qM878RNrHYlqvqiZdmXsJ90cGBOz26UvEs069ZYqaU",
  { realtime: { transport: ws } }
);

function daysAgo(n, hour, minute) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour ?? 12, minute ?? 0, 0, 0);
  return d.toISOString();
}

const SOURCES = ["car_card", "vehicle_detail_sidebar", "vehicle_detail_mobile"];

// Gerçek araçları çek
const { data: carRows } = await supabase.from("cars").select("id, brand, model, year, price");
const cars = carRows ?? [];
if (cars.length === 0) { console.error("Araç bulunamadı!"); process.exit(1); }
console.log(`${cars.length} araç bulundu.`);

const waRows = [];
const pvRows = [];

// Son 7 gün WA — yoğun
const waCounts = [4, 8, 6, 13, 9, 17, 5];
for (let day = 6; day >= 0; day--) {
  const n = waCounts[6 - day];
  for (let i = 0; i < n; i++) {
    const car = cars[Math.floor(Math.random() * cars.length)];
    waRows.push({
      car_id: car.id,
      car_brand: car.brand,
      car_model: car.model,
      car_year: car.year,
      car_price: car.price,
      source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
      phone_target: "905321234567",
      message: `${car.brand} ${car.model} ${car.year} hakkında bilgi almak istiyorum.`,
      created_at: daysAgo(day, 9 + Math.floor(Math.random() * 11), Math.floor(Math.random() * 59)),
    });
  }
}
// Önceki 3 hafta
for (let day = 7; day <= 27; day++) {
  const n = Math.floor(Math.random() * 5) + 1;
  for (let i = 0; i < n; i++) {
    const car = cars[Math.floor(Math.random() * cars.length)];
    waRows.push({
      car_id: car.id,
      car_brand: car.brand,
      car_model: car.model,
      car_year: car.year,
      car_price: car.price,
      source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
      phone_target: "905321234567",
      message: `${car.brand} ${car.model} ${car.year} hakkında bilgi almak istiyorum.`,
      created_at: daysAgo(day, 9 + Math.floor(Math.random() * 11), Math.floor(Math.random() * 59)),
    });
  }
}

// page_views
const pvCounts = [22, 38, 31, 51, 44, 63, 27];
for (let day = 6; day >= 0; day--) {
  const n = pvCounts[6 - day];
  for (let i = 0; i < n; i++) {
    const isDetail = Math.random() > 0.35;
    const car = cars[Math.floor(Math.random() * cars.length)];
    pvRows.push({
      path: isDetail ? `/ilan/${car.id}` : "/",
      referrer: ["", "https://www.google.com", "https://arabam.com", ""][Math.floor(Math.random() * 4)],
      created_at: daysAgo(day, 8 + Math.floor(Math.random() * 13), Math.floor(Math.random() * 59)),
    });
  }
}
for (let day = 7; day <= 27; day++) {
  const n = Math.floor(Math.random() * 18) + 6;
  for (let i = 0; i < n; i++) {
    const isDetail = Math.random() > 0.4;
    const car = cars[Math.floor(Math.random() * cars.length)];
    pvRows.push({
      path: isDetail ? `/ilan/${car.id}` : "/",
      referrer: ["", "https://www.google.com", "https://arabam.com"][Math.floor(Math.random() * 3)],
      created_at: daysAgo(day, 8 + Math.floor(Math.random() * 13), Math.floor(Math.random() * 59)),
    });
  }
}

// SQL üret
const esc = (s) => String(s ?? "").replace(/'/g, "''");

let sql = "-- Sancaktar Fake Data Seed\n\n";

sql += "-- 1. WhatsApp tıklamaları\n";
sql += "INSERT INTO whatsapp_clicks (car_id, car_brand, car_model, car_year, car_price, source, phone_target, message, created_at) VALUES\n";
sql += waRows.map(r =>
  `  ('${esc(r.car_id)}','${esc(r.car_brand)}','${esc(r.car_model)}',${r.car_year},${r.car_price},'${r.source}','${r.phone_target}','${esc(r.message)}','${r.created_at}')`
).join(",\n") + ";\n\n";

sql += "-- 2. Sayfa görüntülemeleri\n";
sql += "INSERT INTO page_views (path, referrer, created_at) VALUES\n";
sql += pvRows.map(r =>
  `  ('${esc(r.path)}','${esc(r.referrer)}','${r.created_at}')`
).join(",\n") + ";\n";

writeFileSync("scripts/seed.sql", sql);
console.log(`\n✅ ${waRows.length} WA + ${pvRows.length} page_view`);
console.log("📄 scripts/seed.sql hazır — Supabase SQL Editor'a yapıştır.");
