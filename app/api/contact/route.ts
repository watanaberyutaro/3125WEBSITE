import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { sendContactMail } from "@/lib/mail-bridge";

export const runtime = "nodejs";

const ContactSchema = z.object({
  name: z.string().trim().min(1, "お名前は必須です"),
  company: z.string().trim().optional().default(""),
  email: z.string().trim().email("メールアドレスの形式が正しくありません"),
  phone: z.string().trim().optional().default(""),
  inquiry: z.string().trim().min(1, "お問い合わせ内容は必須です"),
  budget: z.string().trim().optional().default(""),
  message: z.string().trim().min(1, "メッセージは必須です"),
  recaptchaToken: z.string().optional().default(""),
});

export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    const formData = await req.formData();
    body = Object.fromEntries(formData.entries()) as Record<string, string>;
  } catch {
    return NextResponse.json({ ok: false, error: "リクエストの形式が不正です" }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(" / ");
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
  const data = parsed.data;

  const recaptchaOk = await verifyRecaptcha(data.recaptchaToken || null, "contact");
  if (!recaptchaOk) {
    return NextResponse.json(
      { ok: false, error: "スパム対策の検証に失敗しました。時間をおいて再度お試しください。" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { error: dbError } = await admin.from("inquiries").insert({
    name: data.name,
    company: data.company || null,
    email: data.email,
    phone: data.phone || null,
    inquiry_type: data.inquiry,
    budget: data.budget || null,
    message: data.message,
    source_path: req.headers.get("referer"),
  });

  if (dbError) {
    console.error("inquiries insert failed:", dbError.message);
    return NextResponse.json(
      { ok: false, error: "送信に失敗しました。お手数ですが info@3125.jp へ直接ご連絡ください。" },
      { status: 500 },
    );
  }

  const mailResult = await sendContactMail({
    name: data.name,
    company: data.company,
    email: data.email,
    phone: data.phone,
    inquiry: data.inquiry,
    budget: data.budget,
    message: data.message,
  });

  if (!mailResult.ok) {
    // inquiriesへの保存は既に成功しているため、リード自体は失われていない。
    // メール未達のみユーザーへ通知し、直接連絡を促す。
    console.error("contact mail bridge failed:", mailResult.error);
    return NextResponse.json(
      { ok: false, error: "メールの送信に失敗しました。お手数ですが info@3125.jp へ直接ご連絡ください。" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
