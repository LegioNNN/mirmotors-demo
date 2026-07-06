-- Sayfa görüntülenmeleri (her ziyarette bir kayıt)
CREATE TABLE IF NOT EXISTS page_views (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path        text NOT NULL,
  referrer    text,
  user_agent  text,
  ip_hash     text,
  created_at  timestamptz DEFAULT now()
);

-- Hız için index
CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON page_views(created_at);
CREATE INDEX IF NOT EXISTS page_views_path_idx ON page_views(path);

-- Anlık online kullanıcılar (heartbeat tablosu)
CREATE TABLE IF NOT EXISTS active_users (
  session_id  text PRIMARY KEY,
  last_seen   timestamptz NOT NULL DEFAULT now(),
  path        text
);

CREATE INDEX IF NOT EXISTS active_users_last_seen_idx ON active_users(last_seen);

-- Row Level Security: sadece okuma açık (anonim), yazma açık (insert/upsert)
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_users ENABLE ROW LEVEL SECURITY;

-- Herkes yazabilir (ziyaretçi tracking)
CREATE POLICY IF NOT EXISTS "page_views_insert" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "page_views_select" ON page_views FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "active_users_upsert" ON active_users FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "active_users_update" ON active_users FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "active_users_select" ON active_users FOR SELECT USING (true);

-- Eski heartbeat kayıtlarını otomatik temizle (30 dakika sonra)
-- Bu bir cron job gerektirir — Supabase pg_cron ile:
-- SELECT cron.schedule('cleanup-active-users', '*/30 * * * *',
--   $$DELETE FROM active_users WHERE last_seen < now() - interval '30 minutes'$$);
