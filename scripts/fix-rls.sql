-- RLS politikalarını düzelt + fake data ekle
-- Supabase SQL Editor'da çalıştır

-- 1. whatsapp_clicks: anon okusun ve yazsın
DROP POLICY IF EXISTS "anon_select_wa" ON whatsapp_clicks;
DROP POLICY IF EXISTS "anon_insert_wa" ON whatsapp_clicks;
CREATE POLICY "anon_select_wa" ON whatsapp_clicks FOR SELECT USING (true);
CREATE POLICY "anon_insert_wa" ON whatsapp_clicks FOR INSERT WITH CHECK (true);

-- 2. page_views: anon okusun ve yazsın
DROP POLICY IF EXISTS "anon_select_pv" ON page_views;
DROP POLICY IF EXISTS "anon_insert_pv" ON page_views;
CREATE POLICY "anon_select_pv" ON page_views FOR SELECT USING (true);
CREATE POLICY "anon_insert_pv" ON page_views FOR INSERT WITH CHECK (true);
