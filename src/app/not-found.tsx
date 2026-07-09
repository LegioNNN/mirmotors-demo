import Link from "next/link";
import { brand } from "@/config/brand";

export default function NotFound() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      style={{ backgroundImage: "url('/bg.png')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <img src={brand.logos.horizontalDark} alt={brand.name} className="h-14 w-auto" />

        <div>
          <p className="text-7xl font-black text-amber-400 leading-none">404</p>
          <p className="mt-2 text-xl font-bold text-white">Sayfa bulunamadı</p>
          <p className="mt-1 text-sm text-gray-300">Aradığın sayfa kaldırılmış ya da taşınmış olabilir.</p>
        </div>

        <Link
          href="/"
          className="rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
