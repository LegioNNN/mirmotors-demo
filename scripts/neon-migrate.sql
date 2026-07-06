-- Sancaktar Otomotiv — Neon Migration
-- Neon dashboard'da SQL Editor'e yapıştır ve çalıştır

-- 1. TABLOLAR

CREATE TABLE IF NOT EXISTS cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  km INTEGER NOT NULL,
  price INTEGER NOT NULL,
  segment TEXT NOT NULL CHECK (segment IN ('Kelepir','Orta Direk','Premium','Yayla Kan')),
  status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif','Opsiyonlu','Satıldı')),
  fuel_type TEXT CHECK (fuel_type IN ('Benzin','Dizel','Elektrik','Hibrit','LPG')),
  transmission TEXT CHECK (transmission IN ('Manuel','Otomatik','Yarı Otomatik')),
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  esnaf_notu TEXT,
  image_url TEXT,
  fuel TEXT,
  gear TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_hero BOOLEAN DEFAULT false,
  ekspertiz_durumu TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads_buying (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  expected_price INTEGER NOT NULL,
  km INTEGER,
  hasar TEXT,
  status TEXT DEFAULT 'Bekliyor' CHECK (status IN ('Bekliyor','Arandı','Ulaşılamadı','Tekrar Aranacak','Kabul Edildi','Reddedildi','Alım Yapıldı')),
  damage_note TEXT,
  has_tramer BOOLEAN DEFAULT false,
  wants_trade BOOLEAN DEFAULT false,
  extra_note TEXT,
  city TEXT,
  district TEXT,
  contact_preference TEXT,
  kvkk_accepted BOOLEAN DEFAULT false,
  admin_note TEXT,
  assigned_to TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  contacted_at TIMESTAMPTZ,
  follow_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS whatsapp_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS whatsapp_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id TEXT,
  car_brand TEXT,
  car_model TEXT,
  car_year INTEGER,
  car_price NUMERIC,
  source TEXT DEFAULT 'vehicle_detail',
  phone_target TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  referrer TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  ip_hash TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS active_users (
  session_id TEXT PRIMARY KEY,
  last_seen TIMESTAMPTZ DEFAULT now(),
  path TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS notifications_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL,
  subscriber_email TEXT,
  subscriber_phone TEXT,
  sent_at TIMESTAMP DEFAULT now()
);

-- 2. MEVCUT VERİ (Supabase'den taşınan)

INSERT INTO cars VALUES ('387b15e9-e74a-4990-95d4-55f579fc124a','Volkswagen','Passat 1.6 TDi',2020,68000,1425000,'Orta Direk','Aktif','Benzin','Otomatik',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782211117754-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782211128794-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782211131632-image.png'],NULL,'2 el, boyasız diye alındı ama kaputta minik bir taş izi var. Onun dışında tertemiz.','2026-06-01 02:18:51+00','2026-06-16 00:16:29+00',NULL,NULL,NULL,false,false,'{"sol_on_camurluk":"Orijinal","sol_on_kapi":"Orijinal","sol_arka_kapi":"Orijinal","sol_arka_camurluk":"Orijinal","on_tampon":"Orijinal","kaput":"Orijinal","tavan":"Orijinal","bagaj":"Orijinal","arka_tampon":"Orijinal","sag_on_camurluk":"Orijinal","sag_on_kapi":"Orijinal","sag_arka_kapi":"Orijinal","sag_arka_camurluk":"Orijinal"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO cars VALUES ('91cdf012-b6d9-428e-9052-9c200705694b','Renault','Clio',2018,110000,685000,'Orta Direk','Aktif','Benzin','Manuel',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782062166139-c1.jpg','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782062184124-c2.jpg','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782062195195-c3.jpg','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782062289374-c4.jpg'],NULL,'On numara arac al bin git','2026-06-15 21:57:55+00','2026-06-16 00:14:55+00',NULL,NULL,NULL,false,false,'{"sol_on_camurluk":"Lokal Boyalı","tavan":"Lokal Boyalı","kaput":"Lokal Boyalı","on_tampon":"Orijinal"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO cars VALUES ('67cf6c29-c99e-483c-a6fd-f513333ef771','Dacia','Duster 1.5 dCi',2020,76000,920000,'Yayla Kan','Aktif','Dizel','Manuel',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210964860-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210968934-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210974427-image.png'],NULL,'İçi dışı biraz yıpranmış, kozmetik masrafı var ama sanayi yüzü göstermez. Alıcısını üzmeyecek mekanik canavar.','2026-06-01 02:18:51+00','2026-06-16 00:16:16+00',NULL,NULL,NULL,true,false,'{"sol_on_camurluk":"Orijinal","sol_on_kapi":"Orijinal","sol_arka_kapi":"Orijinal","sol_arka_camurluk":"Orijinal","on_tampon":"Orijinal","kaput":"Orijinal","tavan":"Orijinal","bagaj":"Orijinal","arka_tampon":"Orijinal","sag_on_camurluk":"Orijinal","sag_on_kapi":"Orijinal","sag_arka_kapi":"Orijinal","sag_arka_camurluk":"Orijinal"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO cars VALUES ('7b78cf25-3c2c-4e91-9d18-c81c59447227','Fiat','Egea',2020,91000,795000,'Orta Direk','Aktif','Dizel','Manuel',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210674856-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210846977-image.png'],NULL,NULL,'2026-06-15 21:57:55+00','2026-06-16 00:15:24+00',NULL,NULL,NULL,false,false,'{"sol_on_camurluk":"Orijinal","sol_on_kapi":"Orijinal","sol_arka_kapi":"Orijinal","sol_arka_camurluk":"Orijinal","on_tampon":"Orijinal","kaput":"Orijinal","tavan":"Orijinal","bagaj":"Orijinal","arka_tampon":"Orijinal","sag_on_camurluk":"Orijinal","sag_on_kapi":"Orijinal","sag_arka_kapi":"Orijinal","sag_arka_camurluk":"Orijinal"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO cars VALUES ('39f85c0c-a709-48b8-a3af-3079e2e0060d','BMW','320i First Edition M Sport',2021,105500,2850000,'Premium','Aktif','Benzin','Otomatik',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782211061872-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782211066026-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782211071976-image.png'],NULL,'Sıfır ayarında, hatasız, full donanım. Boya kalınlıkları fabrika çıkışı. Ciddi alıcı gelsin.','2026-06-01 02:18:51+00','2026-06-01 02:18:51+00',NULL,NULL,NULL,false,false,'{"sol_on_camurluk":"Orijinal","sol_on_kapi":"Orijinal","sol_arka_kapi":"Orijinal","sol_arka_camurluk":"Orijinal","on_tampon":"Orijinal","kaput":"Orijinal","tavan":"Orijinal","bagaj":"Orijinal","arka_tampon":"Orijinal","sag_on_camurluk":"Orijinal","sag_on_kapi":"Orijinal","sag_arka_kapi":"Orijinal","sag_arka_camurluk":"Orijinal"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO cars VALUES ('622b5ef9-83fb-4b52-9cc8-baa5ffbd2468','Fiat','Doblo 1.3 Multijet',2011,340000,275000,'Yayla Kan','Aktif','Dizel','Manuel',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782211033766-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782211037414-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782211041575-image.png'],NULL,'5 değişeni var, motor açılmadı, turbo yeni. Yaylaya çık, dön. Arabadan anlayana.','2026-06-01 02:18:51+00','2026-06-16 00:16:49+00',NULL,NULL,NULL,false,false,'{"sol_on_camurluk":"Orijinal","sol_on_kapi":"Orijinal","sol_arka_kapi":"Orijinal","sol_arka_camurluk":"Orijinal","on_tampon":"Orijinal","kaput":"Orijinal","tavan":"Orijinal","bagaj":"Orijinal","arka_tampon":"Orijinal","sag_on_camurluk":"Orijinal","sag_on_kapi":"Orijinal","sag_arka_kapi":"Orijinal","sag_arka_camurluk":"Orijinal"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO cars VALUES ('c8b60126-8cf4-4d00-9868-5957b7698af0','Opel','Astra',2012,205000,545000,'Kelepir','Satıldı','LPG','Manuel',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1781568933565-images.jpg'],NULL,NULL,'2026-06-15 21:57:55+00','2026-06-16 00:15:34+00',NULL,NULL,NULL,false,false,NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO cars VALUES ('644325fe-f65f-455e-b4dd-ceecb6cab671','Volkswagen','Passat',2016,178000,1185000,'Premium','Opsiyonlu','Dizel','Otomatik',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1781568865685-1000216882-69df9ab07f42b-900_675.jpg'],NULL,NULL,'2026-06-15 21:57:55+00','2026-06-16 00:14:26+00',NULL,NULL,NULL,false,false,NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO cars VALUES ('f7156b7c-b347-4385-a5fe-e78a1babd1b5','Renault','Clio 4 Joy 1.2',2016,142000,495000,'Kelepir','Aktif','Benzin','Manuel',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1781569018697-x5_12498152067i7.jpg','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210934864-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210942697-image.png'],NULL,'Sağında solunda boyanacak, çürük çarık yerleri var ama motor yürüyen saat gibi.','2026-06-01 02:18:51+00','2026-06-16 00:16:59+00',NULL,NULL,NULL,false,false,'{"sol_on_camurluk":"Orijinal","sol_on_kapi":"Orijinal","sol_arka_kapi":"Orijinal","sol_arka_camurluk":"Orijinal","on_tampon":"Orijinal","kaput":"Orijinal","tavan":"Orijinal","bagaj":"Orijinal","arka_tampon":"Orijinal","sag_on_camurluk":"Orijinal","sag_on_kapi":"Orijinal","sag_arka_kapi":"Orijinal","sag_arka_camurluk":"Orijinal"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO cars VALUES ('f7df9b91-3c85-4a9a-814f-308d2468986b','Ford','Focus',2015,162000,720000,'Orta Direk','Aktif','Dizel','Manuel',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782122093349-f1.jpg','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782122097566-f2.jpg','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782122102500-f3.jpg'],NULL,NULL,'2026-06-15 21:57:55+00','2026-06-16 00:15:12+00',NULL,NULL,NULL,false,false,'{"sol_on_camurluk":"Orijinal","sol_on_kapi":"Orijinal","sol_arka_kapi":"Orijinal","sol_arka_camurluk":"Orijinal","on_tampon":"Orijinal","kaput":"Orijinal","tavan":"Orijinal","bagaj":"Orijinal","arka_tampon":"Orijinal","sag_on_camurluk":"Orijinal","sag_on_kapi":"Orijinal","sag_arka_kapi":"Orijinal","sag_arka_camurluk":"Orijinal"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO cars VALUES ('674bfc89-5be7-4b92-9be5-8b29e08b1717','Tofaş','Doğan L',1991,200000,120000,'Kelepir','Aktif','Benzin','Manuel',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782209948056-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782209957067-image.png'],NULL,'Aracımın bakımları tam, uzun süre masraf çıkarmayacak durumdadır','2026-06-23 10:20:08+00','2026-06-23 10:20:07+00',NULL,NULL,NULL,false,false,'{"sol_on_camurluk":"Orijinal","sol_on_kapi":"Orijinal","sol_arka_kapi":"Orijinal","sol_arka_camurluk":"Orijinal","on_tampon":"Orijinal","kaput":"Orijinal","tavan":"Orijinal","bagaj":"Orijinal","arka_tampon":"Orijinal","sag_on_camurluk":"Orijinal","sag_on_kapi":"Orijinal","sag_arka_kapi":"Orijinal","sag_arka_camurluk":"Orijinal"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO cars VALUES ('0b690530-ec68-4409-80c4-cef84931bcdd','Tofaş','Kartal',1900,999999,50000,'Kelepir','Aktif','Benzin','Manuel',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782121781074-ekran_g_r_nt_s__2026-06-22_124925.jpg'],'https://d.rapidcdn.app/v2?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9','Kartal sancaktar','2026-06-22 09:49:46+00','2026-06-22 09:49:47+00',NULL,NULL,NULL,false,false,'{"sol_on_camurluk":"Değişen","sol_on_kapi":"Değişen","sol_arka_kapi":"Değişen","sol_arka_camurluk":"Değişen","on_tampon":"Değişen","kaput":"Boyalı","tavan":"Boyalı","bagaj":"Boyalı","arka_tampon":"Lokal Boyalı","sag_on_camurluk":"Değişen","sag_on_kapi":"Boyalı","sag_arka_kapi":"Boyalı","sag_arka_camurluk":"Değişen"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO cars VALUES ('d92a2cad-a524-47a1-b87d-8f904da4478d','Opel','Corsa 1.5',2020,189999,600000,'Orta Direk','Aktif','Dizel','Manuel',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210017313-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210028906-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210034946-image.png'],NULL,'Aracımız Hatasız Boyasızdır','2026-06-23 10:22:00+00','2026-06-23 10:22:00+00',NULL,NULL,NULL,false,false,'{"sol_on_camurluk":"Orijinal","sol_on_kapi":"Orijinal","sol_arka_kapi":"Orijinal","sol_arka_camurluk":"Orijinal","on_tampon":"Orijinal","kaput":"Orijinal","tavan":"Orijinal","bagaj":"Orijinal","arka_tampon":"Orijinal","sag_on_camurluk":"Orijinal","sag_on_kapi":"Orijinal","sag_arka_kapi":"Orijinal","sag_arka_camurluk":"Orijinal"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO cars VALUES ('7fe06ce5-5b90-496c-888b-8703fb4dd4fe','Ferrari','458',2012,125000,9000000,'Premium','Aktif','Benzin','Otomatik',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1781967704646-x5_1259434338kmk.jpg'],NULL,NULL,'2026-06-16 15:23:18+00','2026-06-20 15:01:45+00',NULL,NULL,NULL,false,true,NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO cars VALUES ('888dcced-9392-4c89-9896-1c8702f52572','BMW','1.16 İ M SPORT',2007,405000,420000,'Orta Direk','Aktif','Benzin','Manuel',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210132843-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210142284-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210147997-image.png'],NULL,'BAKIMLARI YENİ YAPILMIŞTIR','2026-06-23 10:23:23+00','2026-06-23 10:23:22+00',NULL,NULL,NULL,false,false,'{"sol_on_camurluk":"Orijinal","sol_on_kapi":"Orijinal","sol_arka_kapi":"Orijinal","sol_arka_camurluk":"Orijinal","on_tampon":"Orijinal","kaput":"Orijinal","tavan":"Orijinal","bagaj":"Orijinal","arka_tampon":"Orijinal","sag_on_camurluk":"Orijinal","sag_on_kapi":"Orijinal","sag_arka_kapi":"Orijinal","sag_arka_camurluk":"Orijinal"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO cars VALUES ('be10f239-0f88-48af-b4cc-94bc56325540','Honda','Civic Eco 1.6',2019,97000,780000,'Kelepir','Opsiyonlu','Benzin','Otomatik',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782121448003-ec.jpg','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782121452450-ec3.jpg','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782121455490-ec5.jpg'],NULL,'Motoru zayıf ama tam bir fiyat/performans aracı, ayağını yerden keser.','2026-06-01 02:18:51+00','2026-06-16 00:16:08+00',NULL,NULL,NULL,false,false,'{"sol_on_camurluk":"Orijinal","sol_on_kapi":"Orijinal","sol_arka_kapi":"Orijinal","sol_arka_camurluk":"Orijinal","on_tampon":"Orijinal","kaput":"Orijinal","tavan":"Orijinal","bagaj":"Orijinal","arka_tampon":"Orijinal","sag_on_camurluk":"Orijinal","sag_on_kapi":"Orijinal","sag_arka_kapi":"Orijinal","sag_arka_camurluk":"Orijinal"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO cars VALUES ('0631cf7d-a5ac-4ad9-918c-187f56a97117','Toyota','Corolla 1.3 XE',1995,420000,255000,'Kelepir','Aktif','Benzin','Manuel',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210291851-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210297172-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210304238-image.png'],NULL,'MOTOR MEKANİK AKSAMI KUSURSUZDUR','2026-06-23 10:25:44+00','2026-06-23 10:25:43+00',NULL,NULL,NULL,false,false,'{"sol_on_camurluk":"Orijinal","sol_on_kapi":"Orijinal","sol_arka_kapi":"Orijinal","sol_arka_camurluk":"Orijinal","on_tampon":"Orijinal","kaput":"Orijinal","tavan":"Orijinal","bagaj":"Orijinal","arka_tampon":"Orijinal","sag_on_camurluk":"Orijinal","sag_on_kapi":"Orijinal","sag_arka_kapi":"Orijinal","sag_arka_camurluk":"Orijinal"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO cars VALUES ('d11904b6-595d-421f-b2e4-644d1679a090','Tofaş','Şahin 1.6',1995,300000,137500,'Orta Direk','Aktif','Benzin','Otomatik',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210355934-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210362314-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210367616-image.png'],NULL,'MOTOR ŞANZIMAN DEFRANSİYEL SORUNSUZ','2026-06-23 10:26:51+00','2026-06-23 10:26:50+00',NULL,NULL,NULL,false,false,'{"sol_on_camurluk":"Orijinal","sol_on_kapi":"Orijinal","sol_arka_kapi":"Orijinal","sol_arka_camurluk":"Orijinal","on_tampon":"Orijinal","kaput":"Orijinal","tavan":"Orijinal","bagaj":"Orijinal","arka_tampon":"Orijinal","sag_on_camurluk":"Orijinal","sag_on_kapi":"Orijinal","sag_arka_kapi":"Orijinal","sag_arka_camurluk":"Orijinal"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO cars VALUES ('9163bacb-606b-451e-9d25-9418f1c661aa','Volkswagen','Polo 1.6',1999,273000,250000,'Kelepir','Aktif','Benzin','Manuel',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210427938-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210431624-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210435594-image.png'],NULL,'ARACIN MOTORUNDA MEKANİĞİNDE ŞANZUMANUNDA SORUN YOKTUR','2026-06-23 10:28:14+00','2026-06-23 10:28:14+00',NULL,NULL,NULL,false,false,'{"sol_on_camurluk":"Değişen","sol_on_kapi":"Orijinal","sol_arka_kapi":"Orijinal","sol_arka_camurluk":"Orijinal","on_tampon":"Orijinal","kaput":"Orijinal","tavan":"Orijinal","bagaj":"Orijinal","arka_tampon":"Orijinal","sag_on_camurluk":"Değişen","sag_on_kapi":"Orijinal","sag_arka_kapi":"Orijinal","sag_arka_camurluk":"Orijinal"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO cars VALUES ('e5f492e4-51ec-4629-8577-716a71edba52','Toyota','Corolla 1.5 Flame X-Pack',2022,54000,1650000,'Orta Direk','Aktif','Hibrit','Otomatik',ARRAY['https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210891040-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210895071-image.png','https://zurhpytymwevhrclnszy.supabase.co/storage/v1/object/public/car-images/cars/1782210899656-image.png'],NULL,'Kilometresi yüksek diye korkma, uzun yolda yorulmadan yapılmış.','2026-06-01 02:18:51+00','2026-06-16 00:16:01+00',NULL,NULL,NULL,false,false,'{"sol_on_camurluk":"Orijinal","sol_on_kapi":"Orijinal","sol_arka_kapi":"Orijinal","sol_arka_camurluk":"Orijinal","on_tampon":"Orijinal","kaput":"Orijinal","tavan":"Orijinal","bagaj":"Orijinal","arka_tampon":"Orijinal","sag_on_camurluk":"Orijinal","sag_on_kapi":"Orijinal","sag_arka_kapi":"Orijinal","sag_arka_camurluk":"Orijinal"}') ON CONFLICT (id) DO NOTHING;

-- WhatsApp numaraları
INSERT INTO whatsapp_numbers (employee_name, phone_number, is_active) VALUES
  ('Anıl Sancaktar', '905019443734', true),
  ('Destek Hattı', '905301234567', true)
ON CONFLICT DO NOTHING;
