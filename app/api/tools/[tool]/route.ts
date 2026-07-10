import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getToolBySlug } from "@/lib/tools/registry";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ tool: string }> }) {
  const { tool: slug } = await params;
  const definition = getToolBySlug(slug);
  if (!definition) {
    return NextResponse.json({ ok: false, error: "ツールが見つかりません" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "リクエストの形式が不正です" }, { status: 400 });
  }

  const raw: Record<string, unknown> = {};
  for (const field of definition.fields) {
    raw[field.name] =
      field.type === "checkboxes" ? formData.getAll(field.name).map(String) : String(formData.get(field.name) ?? "");
  }

  const parsed = definition.schema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(" / ");
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  let output;
  try {
    output = definition.run(parsed.data);
  } catch (e) {
    console.error(`tool run failed (${slug}):`, e);
    return NextResponse.json(
      { ok: false, error: "生成に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 },
    );
  }

  const email = String(formData.get("email") ?? "").trim();
  const admin = createAdminClient();
  const { error: dbError } = await admin.from("tool_leads").insert({
    tool_slug: slug,
    input: parsed.data,
    output,
    email: email || null,
  });
  if (dbError) {
    // ログ保存に失敗してもユーザー体験は止めない。結果はそのまま返す。
    console.error("tool_leads insert failed:", dbError.message);
  }

  return NextResponse.json({ ok: true, output });
}
