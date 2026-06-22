import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], display: "swap", weight: ["700", "600"] });

export const metadata: Metadata = {
  title: "Sancaktar Otomotiv",
  description:
    "Sancaktar Otomotiv – 750 Araçlık Vitrin. Güvenilir, hızlı ve şeffaf araç alım-satım.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} overflow-x-hidden bg-[#f9fafb] text-[#111827] antialiased`}>
        {children}
      </body>
    </html>
  );
}
