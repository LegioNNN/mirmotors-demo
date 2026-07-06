import { NextRequest, NextResponse } from "next/server";
import { brand } from "@/config/brand";

const RESEND_KEY = process.env.RESEND_API_KEY;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? "ahmetozcans456@gmail.com";

interface LeadPayload {
  customer_name: string;
  phone: string;
  brand: string;
  model: string;
  year: number;
  expected_price: number;
  km?: string;
  city?: string;
  district?: string;
  extra_note?: string;
  contact_preference?: string;
  has_tramer?: boolean;
  wants_trade?: boolean;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("tr-TR").format(n) + " ₺";
}

function buildEmailHtml(lead: LeadPayload): string {
  const rows = [
    ["Müşteri", lead.customer_name],
    ["Telefon", `<a href="tel:${lead.phone}" style="color:#059669">${lead.phone}</a>`],
    ["Araç", `${lead.brand} ${lead.model} ${lead.year}`],
    ["Fiyat Beklentisi", formatPrice(lead.expected_price)],
    ["KM", lead.km ?? "—"],
    ["Şehir / İlçe", [lead.city, lead.district].filter(Boolean).join(" / ") || "—"],
    ["İletişim Tercihi", lead.contact_preference ?? "—"],
    ["Takas", lead.wants_trade ? "Evet" : "Hayır"],
    ["Tramer", lead.has_tramer ? "Var" : "Yok"],
    ["Ek Not", lead.extra_note ?? "—"],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) => `
    <tr>
      <td style="padding:8px 12px;font-size:13px;color:#6b7280;white-space:nowrap;border-bottom:1px solid #f3f4f6">${label}</td>
      <td style="padding:8px 12px;font-size:13px;color:#111827;font-weight:600;border-bottom:1px solid #f3f4f6">${value}</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:32px auto">
    <tr>
      <td style="background:#111827;padding:24px 28px;border-radius:12px 12px 0 0">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;color:#9ca3af;text-transform:uppercase">${brand.name}</p>
        <h1 style="margin:4px 0 0;font-size:20px;color:#fff">🚗 Yeni Araç Satış Talebi</h1>
      </td>
    </tr>
    <tr>
      <td style="background:#fff;padding:4px 0;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">
        <table width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
      </td>
    </tr>
    <tr>
      <td style="background:#fff;padding:20px 28px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;border-radius:0 0 12px 12px">
        <a href="tel:${lead.phone}" style="display:inline-block;background:#059669;color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none">
          📞 ${lead.phone} — Hemen Ara
        </a>
        <p style="margin:12px 0 0;font-size:11px;color:#9ca3af">
          ${brand.name} Admin Paneli'nden de takip edebilirsiniz.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const lead: LeadPayload = await req.json();

    if (!RESEND_KEY) {
      // Resend key yoksa sessizce geç — site çalışmaya devam etsin
      return NextResponse.json({ ok: true, skipped: true });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${brand.name} <onboarding@resend.dev>`,
        to: [NOTIFY_EMAIL],
        subject: `🚗 Yeni Talep: ${lead.brand} ${lead.model} ${lead.year} — ${lead.customer_name}`,
        html: buildEmailHtml(lead),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return NextResponse.json({ ok: false, error: err }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("notify-lead error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
