import { supabase } from "@/lib/supabase";

/**
 * Uploads an image file to Supabase Storage "car-images" bucket.
 * Returns the public URL of the uploaded image.
 */
export async function uploadCarImage(file: File): Promise<string> {
  const timestamp = Date.now();
  const safeFileName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .toLowerCase();
  const filePath = `cars/${timestamp}-${safeFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("car-images")
    .upload(filePath, file, {
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
