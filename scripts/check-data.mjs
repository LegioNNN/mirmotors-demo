import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const supabase = createClient(
  "https://zurhpytymwevhrclnszy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cmhweXR5bXdldmhyY2xuc3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNjA2NzEsImV4cCI6MjA5NTgzNjY3MX0.1qM878RNrHYlqvqiZdmXsJ90cGBOz26UvEs069ZYqaU",
  { realtime: { transport: ws } }
);

const { count: waCount, error: waErr } = await supabase
  .from("whatsapp_clicks").select("*", { count: "exact", head: true });
console.log("whatsapp_clicks:", waCount, waErr?.message ?? "");

const { count: pvCount, error: pvErr } = await supabase
  .from("page_views").select("*", { count: "exact", head: true });
console.log("page_views:", pvCount, pvErr?.message ?? "");

// Son 1 kayıt
const { data: lastWa } = await supabase.from("whatsapp_clicks").select("car_brand,car_model,created_at").order("created_at", { ascending: false }).limit(1);
console.log("Son WA:", lastWa);

const { data: lastPv } = await supabase.from("page_views").select("path,created_at").order("created_at", { ascending: false }).limit(1);
console.log("Son PV:", lastPv);
