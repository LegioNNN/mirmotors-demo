import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sancaktar",
  description: "750 Araçlık Vitrin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
