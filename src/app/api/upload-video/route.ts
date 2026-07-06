import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET_NAME ?? "sancaktar-videos";
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

const MAX_SIZE = 200 * 1024 * 1024; // 200 MB

function getS3Client() {
  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error("R2 env vars missing");
  }
  return new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const carId = formData.get("carId") as string | null;

    if (!file) return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
    if (!carId) return NextResponse.json({ error: "Araç ID gerekli" }, { status: 400 });

    const allowed = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Sadece MP4, MOV, WEBM, AVI yüklenebilir" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Dosya 200 MB'dan büyük olamaz" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "mp4";
    const key = `videos/${carId}/${Date.now()}.${ext}`;

    const s3 = getS3Client();
    const bytes = await file.arrayBuffer();

    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: Buffer.from(bytes),
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    const publicUrl = `${R2_PUBLIC_URL}/${key}`;
    return NextResponse.json({ ok: true, url: publicUrl });
  } catch (err) {
    console.error("upload-video error:", err);
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export const maxDuration = 60;
