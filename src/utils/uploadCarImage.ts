import { supabase } from "@/lib/supabase";
import { brand } from "@/config/brand";

async function addWatermark(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context failed"));

        ctx.drawImage(img, 0, 0);

        // Watermark — alt sağ köşe, transparent
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        const watermarkText = brand.name.toUpperCase();
        ctx.fillText(watermarkText, img.width - 20, img.height - 20);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Watermark blob failed"));
        }, file.type, 0.95);
      };
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

export async function uploadCarImage(file: File): Promise<string> {
  const timestamp = Date.now();
  const safeFileName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .toLowerCase();
  const filePath = `cars/${timestamp}-${safeFileName}`;

  // Watermark ekle
  const watermarkedBlob = await addWatermark(file);
  const watermarkedFile = new File([watermarkedBlob], safeFileName, { type: file.type });

  const { error: uploadError } = await supabase.storage
    .from("car-images")
    .upload(filePath, watermarkedFile, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from("car-images")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
