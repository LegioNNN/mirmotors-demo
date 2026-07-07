/**
 * ─── MARKA KONFİGÜRASYONU ───────────────────────────────────────────────────
 * Sitenizi başkasına kurarken yalnızca bu dosyayı doldurun.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const brand = {
  // ── Şirket adı ────────────────────────────────────────────────────────────
  name: "Mir Motors",
  shortName: "Mir",
  tagline: "Motors",
  description: "Geniş Araç Vitrini",

  // ── Konum ─────────────────────────────────────────────────────────────────
  city: "İstanbul",
  district: "Ataşehir",
  address: "Ferhatpaşa, 9. Sk. No:37, 34750 Ataşehir / İstanbul",
  licenseNo: "3408026",

  // ── Stok & Slogan ─────────────────────────────────────────────────────────
  stockText: "Geniş Araç Stoku",
  workingHours: "Hft. İçi 09:00–19:00 · Cmt 10:00–17:00",
  motto: "Konsinye Araç Satışımız Yoktur",

  // ── Telefon numaraları ────────────────────────────────────────────────────
  primaryPhone: "+905333255872",
  primaryPhoneDisplay: "0533 325 58 72",
  phones: [
    { name: "Recep", number: "5333255872", display: "0533 325 58 72", label: "Recep" },
    { name: "Hat 2", number: "5419617258", display: "0541 961 72 58", label: "Hat 2" },
    { name: "Hat 3", number: "5403253458", display: "0540 325 34 58", label: "Hat 3" },
  ],
  feedbackWhatsapp: "905333255872",

  // ── Yetkili kişi ──────────────────────────────────────────────────────────
  owner: {
    name: "Recep Çidaçi",
    title: "Mir Motors Yetkilisi",
    initials: "RC",
    since: 2018,
    photo: "/recep-cidaci.png",         // public/ klasörüne eklenecek
    instagramHandle: "@mir_motors",
    instagramUrl: "https://www.instagram.com/mir_motors",
    instagramFollowers: "709B",
    noteLabel: "Recep'in Notu",
  },

  // ── Sosyal medya ──────────────────────────────────────────────────────────
  social: {
    instagram: {
      handle: "@mir_motors",
      url: "https://www.instagram.com/mir_motors",
      posts: "674",
      followers: "709B",
      sub: "Used Vehicles",
    },
    tiktok: {
      handle: "@mir_motors",
      url: "https://www.tiktok.com/@mir_motors",
      displayName: "Mir Motors",
      followers: "—",
      likes: "—",
    },
    facebook: {
      handle: "Mir Motors",
      sub: "Mir Motors",
      url: "https://www.facebook.com/mirmotors",
      followers: "—",
    },
    whatsappChannel: {
      url: "https://www.whatsapp.com/channel/0029Vb20KZ80lwgjqaIuJA1L",
      followers: "—",
    },
    sahibinden: "https://mirmotors.sahibinden.com",   // Gerçek URL Recep'ten
  },

  // ── Google Maps ───────────────────────────────────────────────────────────
  mapsUrl: "https://maps.google.com/?q=Ferhatpaşa+9.+Sk+No:37+Ataşehir+İstanbul",
  mapsEmbedUrl: "https://www.google.com/maps?q=Ferhatpa%C5%9Fa%2C+9.+Sk+No%3A37%2C+34750+Ata%C5%9Fehir%2F%C4%B0stanbul&output=embed",

  // ── Logo dosyaları (public/ klasörü) ─────────────────────────────────────
  logos: {
    horizontal: "/mir-logo-yatay.svg",
    horizontalDark: "/mir-logo-yatay-koyu.svg",
    icon: "/mir-ikon.svg",
  },

  // ── GaleriTok özelliği ────────────────────────────────────────────────────
  tok: {
    letter: "M",
    label: "irTok",
  },

  // ── Admin paneli ──────────────────────────────────────────────────────────
  adminPassword: "mirmotors2026",
  adminAuthKey: "mirmotors_admin_auth",
};
