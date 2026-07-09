import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://zurhpytymwevhrclnszy.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_ukM_v4dwKRX8rW4zdzod_g_4n6FUz04";

// Build sırasında env yoksa dummy client döndür (hata vermesin)
function createDummyClient() {
  return new Proxy(
    {},
    {
      get(_target, _prop) {
        return (..._args: unknown[]) => {
          console.warn(`supabase.${String(_prop)}() env eksik olduğu için çalıştırılmadı`);
          return Promise.resolve({ data: null, error: { message: "Supabase env'leri eksik" } });
        };
      },
    }
  ) as ReturnType<typeof createClient>;
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createDummyClient();
