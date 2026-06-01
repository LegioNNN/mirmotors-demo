import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Sancaktar Otomotiv",
  description:
    "Sancaktar Otomotiv – 750 Araçlık Vitrin. Güvenilir, hızlı ve şeffaf araç alım-satım.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-[#f9fafb] text-[#111827] antialiased`}>
        {children}
      </body>
    </html>
  );
}
