import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPathAllowed, serializeToMarkdown } from "@/lib/admin/publish";
import { putFile } from "@/lib/git/github";

export const runtime = "nodejs";

/**
 * publish_jobs INSERT時にSupabase側のpg_netトリガー(0008_publish_jobs.sql参照)
 * から即座に呼ばれる。呼び出し元はSupabase(Postgres)であり通常のブラウザ/staff
 * セッションではないため、認可はX-Publish-Secretヘッダー(Supabase Vault保管の
 * 共有シークレット)のみで行う。
 *
 * 常に200を返す方針: Supabase側の再送ポリシーに委ねるのではなく、このハンドラ
 * 自身がjobのstatusを唯一の真実として管理し、失敗はstatus='failed'として記録する
 * （2xx以外を返すとpg_net側が独自の再試行をし、二重pushにつながる恐れがあるため）。
 */
export async function POST(req: Request) {
  const secret = req.headers.get("x-publish-secret");
  if (!secret || secret !== process.env.PUBLISH_JOB_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const jobId = body?.jobId;
  if (typeof jobId !== "string") {
    return NextResponse.json({ ok: false, error: "jobId is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: job, error: jobError } = await admin
    .from("publish_jobs")
    .select("*, drafts(content_type)")
    .eq("id", jobId)
    .maybeSingle();
  if (jobError || !job) {
    return NextResponse.json({ ok: false, error: "job not found" }, { status: 200 });
  }

  // 冪等性: pending以外(既に処理済み/処理中)なら何もしない。Webhookの多重発火対策。
  if (job.status !== "pending") {
    return NextResponse.json({ ok: true, skipped: true, status: job.status }, { status: 200 });
  }

  await admin.from("publish_jobs").update({ status: "processing" }).eq("id", jobId);

  const contentType = job.drafts?.content_type;
  if (!contentType || !isPathAllowed(job.target_path, contentType)) {
    await admin
      .from("publish_jobs")
      .update({
        status: "failed",
        error_message: `許可されていないパスまたは未対応の種別です（service_pageはcontent/services/配下の.mdファイルのみpush可能。それ以外の種別はまだ公開先の実装がありません）: ${job.target_path}`,
        processed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
    return NextResponse.json({ ok: false, error: "path not allowed" }, { status: 200 });
  }

  const { data: version, error: versionError } = await admin
    .from("draft_versions")
    .select("title, body_markdown, seo_title, seo_description, faq, cta_label, cta_href")
    .eq("id", job.draft_version_id)
    .maybeSingle();

  if (versionError || !version) {
    await admin
      .from("publish_jobs")
      .update({
        status: "failed",
        error_message: `対象バージョンの取得に失敗しました: ${versionError?.message ?? "not found"}`,
        processed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
    return NextResponse.json({ ok: false, error: "version not found" }, { status: 200 });
  }

  try {
    const processedAt = new Date().toISOString();
    const markdown = serializeToMarkdown(version, processedAt);
    const result = await putFile(job.target_path, markdown, `docs: publish ${job.target_path} via draft ${job.draft_id}`);

    await admin
      .from("publish_jobs")
      .update({
        status: "succeeded",
        commit_sha: result.commitSha,
        commit_url: result.commitUrl,
        processed_at: processedAt,
      })
      .eq("id", jobId);

    await admin.from("drafts").update({ status: "published" }).eq("id", job.draft_id);

    return NextResponse.json({ ok: true, commitSha: result.commitSha }, { status: 200 });
  } catch (e) {
    await admin
      .from("publish_jobs")
      .update({
        status: "failed",
        error_message: (e as Error).message,
        processed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 200 });
  }
}
