import { pgTable, uuid, text, integer, boolean, timestamp, bigserial, numeric } from "drizzle-orm/pg-core";

export const cars = pgTable("cars", {
  id: uuid("id").primaryKey().defaultRandom(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  km: integer("km").notNull(),
  price: integer("price").notNull(),
  segment: text("segment").notNull(),
  status: text("status").default("Aktif"),
  fuel_type: text("fuel_type"),
  transmission: text("transmission"),
  images: text("images").array().default([]),
  video_url: text("video_url"),
  esnaf_notu: text("esnaf_notu"),
  image_url: text("image_url"),
  fuel: text("fuel"),
  gear: text("gear"),
  is_featured: boolean("is_featured").default(false),
  is_hero: boolean("is_hero").default(false),
  ekspertiz_durumu: text("ekspertiz_durumu"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const leads_buying = pgTable("leads_buying", {
  id: uuid("id").primaryKey().defaultRandom(),
  customer_name: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  expected_price: integer("expected_price").notNull(),
  km: integer("km"),
  hasar: text("hasar"),
  status: text("status").default("Bekliyor"),
  damage_note: text("damage_note"),
  has_tramer: boolean("has_tramer").default(false),
  wants_trade: boolean("wants_trade").default(false),
  extra_note: text("extra_note"),
  city: text("city"),
  district: text("district"),
  contact_preference: text("contact_preference"),
  kvkk_accepted: boolean("kvkk_accepted").default(false),
  admin_note: text("admin_note"),
  assigned_to: text("assigned_to"),
  photo_urls: text("photo_urls").array().default([]),
  contacted_at: timestamp("contacted_at", { withTimezone: true }),
  follow_up_at: timestamp("follow_up_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const whatsapp_numbers = pgTable("whatsapp_numbers", {
  id: uuid("id").primaryKey().defaultRandom(),
  employee_name: text("employee_name").notNull(),
  phone_number: text("phone_number").notNull(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

export const whatsapp_clicks = pgTable("whatsapp_clicks", {
  id: uuid("id").primaryKey().defaultRandom(),
  car_id: text("car_id"),
  car_brand: text("car_brand"),
  car_model: text("car_model"),
  car_year: integer("car_year"),
  car_price: numeric("car_price"),
  source: text("source").default("vehicle_detail"),
  phone_target: text("phone_target"),
  message: text("message"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const page_views = pgTable("page_views", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  path: text("path").notNull(),
  referrer: text("referrer").default(""),
  user_agent: text("user_agent").default(""),
  ip_hash: text("ip_hash").default(""),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const active_users = pgTable("active_users", {
  session_id: text("session_id").primaryKey(),
  last_seen: timestamp("last_seen", { withTimezone: true }).defaultNow(),
  path: text("path").default(""),
});

export const notifications_subscriptions = pgTable("notifications_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique(),
  phone: text("phone").unique(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

export const notifications_sent = pgTable("notifications_sent", {
  id: uuid("id").primaryKey().defaultRandom(),
  car_id: uuid("car_id").notNull(),
  subscriber_email: text("subscriber_email"),
  subscriber_phone: text("subscriber_phone"),
  sent_at: timestamp("sent_at").defaultNow(),
});
