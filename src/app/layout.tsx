import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { brand } from "@/config/brand";
import PwaInstaller from "@/components/ui/PwaInstaller";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], display: "swap", weight: ["700", "600"] });

export const metadata: Metadata = {
  title: {
    default: brand.name,
    template: `%s | ${brand.shortName}`,
  },
  description: `${brand.name} – ${brand.description}. ${brand.city} ${brand.district}'de güvenilir, hızlı ve şeffaf araç alım-satım.`,
  keywords: [`${brand.city} ikinci el araç`, `${brand.district} galeri`, `araç alım satım`, brand.name, `${brand.city} oto galeri`],
  authors: [{ name: brand.name }],
  creator: brand.name,
  metadataBase: new URL(`https://${brand.shortName.toLowerCase()}.com`),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: brand.name,
    title: brand.name,
    description: `${brand.name} – ${brand.description}. ${brand.city} ${brand.district}'de güvenilir araç alım-satım.`,
    images: [{ url: brand.logos.horizontal, width: 1200, height: 630, alt: brand.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: brand.name,
    description: `${brand.description}. ${brand.city} ${brand.district}.`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="apple-touch-startup-image" href="/bg.png" />
      </head>
      <body className={`${inter.className} overflow-x-hidden bg-[#f9fafb] text-[#111827] antialiased`}>
        {children}
        <PwaInstaller />
      </body>
    </html>
  );
}
