/**
 * Sahte araba görselleri — gerçek projede S3/CloudFront'ten gelecek.
 * 16/9 kırpılmış, stüdyo loş ışıklı galeri kalitesinde mock URL'ler.
 * Her araç id'sine özel bir görsel döndürülür.
 */

const imagePool: string[] = [
  "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&q=85&fit=crop&ar=16:9",
  "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=85&fit=crop&ar=16:9",
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=85&fit=crop&ar=16:9",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=85&fit=crop&ar=16:9",
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=85&fit=crop&ar=16:9",
  "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=85&fit=crop&ar=16:9",
  "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=85&fit=crop&ar=16:9",
  "https://images.unsplash.com/photo-1554744511-d6c603f27c54?w=800&q=85&fit=crop&ar=16:9",
];

/** ID'ye göre kararlı (deterministic) bir görsel döndür */
export function getCarImage(carId: string): string {
  // ID'deki harflerin charCode toplamına göre indeks seç
  const hash = carId
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return imagePool[hash % imagePool.length];
}

