import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.name,
    short_name: brand.shortName,
    description: `${brand.city}'da güvenilir araç alım-satım. ${brand.description}.`,
    start_url: "/",
    display: "standalone",
    background_color: "#111827",
    theme_color: "#111827",
    orientation: "portrait-primary",
    lang: "tr",
    categories: ["automotive", "shopping"],
    icons: [
      {
        src: brand.logos.icon,
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-mobile.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: `${brand.name} Araç Vitrini`,
      },
    ],
    shortcuts: [
      {
        name: "Araçları Gör",
        url: "/?araclara-git=1",
        description: "Stokta bulunan araçları görüntüle",
      },
      {
        name: "Aracını Sat",
        url: "/?arac-sat=1",
        description: "Aracını sat veya takas et",
      },
    ],
  };
}
