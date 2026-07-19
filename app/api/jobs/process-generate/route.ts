import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { callDeepSeekChat } from "@/lib/ai/deepseek";

export const runtime = "nodejs";
// DeepSeek APIは実測で1リクエスト(全フィールド生成)あたり10秒未満で完了する。
// タイムアウト(60秒) + DB往復分の余裕を見て設定。
export const maxDuration = 90;

const ARTICLE_SCHEMA_HINT = `{"title":"string","body_markdown":"string (Markdown形式、600〜900字程度、見出しを含む)","seo_title":"string (60字以内)","seo_description":"string (160字以内)","faq":[{"question":"string","answer":"string"}] (0〜3件)}`;
const SERVICE_PAGE_SCHEMA_HINT = `{"title":"string","body_markdown":"string (Markdown形式、600〜900字程度、見出しを含む)","seo_title":"string (60字以内)","seo_description":"string (160字以内)","cta_label":"string (行動喚起ボタンの文言)","faq":[{"question":"string","answer":"string"}] (0〜3件)}`;

const REVIEW_COMMENT_TYPE_LABEL: Record<string, string> = { rejection: "却下", revision: "修正依頼" };

/**
 * rejection_rules(Phase7)からcontent_type一致・active=trueのルールを取得し、
 * システムプロンプトに注入する。0件なら何も追記しない(既存動作を壊さない)。
 * staffが個別のコメントを明示的に「ルール化」した時だけ増える設計のため、
 * 上限20件で十分（無制限にプロンプトが肥大化するのを防ぐ）。
 */
async function fetchActiveRules(
  admin: ReturnType<typeof createAdminClient>,
  contentType: string,
): Promise<string[]> {
  const { data } = await admin
    .from("rejection_rules")
    .select("rule_text")
    .eq("content_type", contentType)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []).map((r) => r.rule_text);
}

function buildSystemPrompt(contentType: string, rules: string[]): string {
  const schema = contentType === "service_page" ? SERVICE_PAGE_SCHEMA_HINT : ARTICLE_SCHEMA_HINT;
  let prompt = `あなたはSEOコンテンツ作成のアシスタントです。必ず以下のJSON形式のみで出力してください。前置き・説明文・マークダウンのコードフェンスは一切不要です。JSON以外の文字を出力しないでください。\n\n${schema}`;
  if (rules.length > 0) {
    prompt += `\n\n過去の却下・修正依頼から学んだ注意点（必ず守ること）:\n${rules.map((r) => `- ${r}`).join("\n")}`;
  }
  return prompt;
}

/**
 * LLM応答からJSONを抽出する。コードフェンス(```json ... ```)で囲まれている
 * 場合はそれを剥がしてからパースする。想定外の形式は例外的にnullを返し、
 * 呼び出し側でjob_runsをfailedにする(壊れた下書きを黙って作らないため)。
 */
function extractJson(content: string): Record<string, unknown> | null {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fenced ? fenced[1] : content;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    const parsed = JSON.parse(candidate.slice(start, end + 1));
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

type GeneratedFields = {
  title: string;
  body_markdown: string;
  seo_title: string | null;
  seo_description: string | null;
  cta_label: string | null;
  cta_href: string | null;
  faq: { question: string; answer: string }[];
};

function normalizeGenerated(raw: Record<string, unknown>, contentType: string): GeneratedFields | null {
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const bodyMarkdown = typeof raw.body_markdown === "string" ? raw.body_markdown.trim() : "";
  if (!title || !bodyMarkdown) return null;

  const faqRaw = Array.isArray(raw.faq) ? raw.faq : [];
  const faq = faqRaw
    .filter((f): f is { question: unknown; answer: unknown } => typeof f === "object" && f !== null)
    .map((f) => ({
      question: typeof f.question === "string" ? f.question : "",
      answer: typeof f.answer === "string" ? f.answer : "",
    }))
    .filter((f) => f.question && f.answer);

  return {
    title,
    body_markdown: bodyMarkdown,
    seo_title: typeof raw.seo_title === "string" && raw.seo_title.trim() ? raw.seo_title.trim() : null,
    seo_description:
      typeof raw.seo_description === "string" && raw.seo_description.trim() ? raw.seo_description.trim() : null,
    cta_label:
      contentType === "service_page" && typeof raw.cta_label === "string" && raw.cta_label.trim()
        ? raw.cta_label.trim()
        : null,
    // cta_hrefはLLMに生成させず固定する(存在しないURLを生成するリスクを避けるため)
    cta_href: contentType === "service_page" ? "/contact" : null,
    faq,
  };
}

/**
 * job_runs INSERT時にnotify_llm_generate_job()トリガー(0010_llm_generate_trigger.sql)
 * から即座に呼ばれる。process-publish/route.tsと同じ設計方針:
 * 認可はX-Generate-Secretヘッダーのみ、常に200を返す、冪等性はstatus状態機械で担保。
 *
 * Phase7でmode('new'|'revise')に対応。'revise'は既存下書きの最新バージョン+
 * review_comments(revision/rejection)を踏まえてAIに書き直させる
 * （Phase4のルールベース版runGenerateFromCommentsのLLM版）。
 * inputにmodeがない場合は'new'として扱う(Phase6時点の呼び出しとの後方互換)。
 */
export async function POST(req: Request) {
  const secret = req.headers.get("x-generate-secret");
  if (!secret || secret !== process.env.LLM_GENERATE_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const jobId = body?.jobId;
  if (typeof jobId !== "string") {
    return NextResponse.json({ ok: false, error: "jobId is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: job, error: jobError } = await admin.from("job_runs").select("*").eq("id", jobId).maybeSingle();
  if (jobError || !job) {
    return NextResponse.json({ ok: false, error: "job not found" }, { status: 200 });
  }

  if (job.status !== "pending") {
    return NextResponse.json({ ok: true, skipped: true, status: job.status }, { status: 200 });
  }

  await admin.from("job_runs").update({ status: "processing" }).eq("id", jobId);

  const input = job.input as { topic?: string; content_type?: string; mode?: string } | null;
  const topic = input?.topic;
  const contentType = input?.content_type;
  const mode = input?.mode === "revise" ? "revise" : "new";

  if (!contentType || (mode === "new" && !topic)) {
    await admin
      .from("job_runs")
      .update({
        status: "failed",
        error_message: "job_runs.inputにtopicまたはcontent_typeがありません",
        processed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
    return NextResponse.json({ ok: false, error: "invalid input" }, { status: 200 });
  }

  try {
    const rules = await fetchActiveRules(admin, contentType);
    const systemPrompt = buildSystemPrompt(contentType, rules);

    let userPrompt: string;
    let versionNumber: number;

    if (mode === "revise") {
      const { data: latestVersion, error: versionFetchError } = await admin
        .from("draft_versions")
        .select("title, body_markdown, version_number")
        .eq("draft_id", job.draft_id)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();
      if (versionFetchError || !latestVersion) throw new Error(`最新バージョンの取得に失敗しました: ${versionFetchError?.message}`);

      const { data: comments, error: commentsError } = await admin
        .from("review_comments")
        .select("comment_type, body")
        .eq("draft_id", job.draft_id)
        .in("comment_type", ["revision", "rejection"])
        .order("created_at", { ascending: false });
      if (commentsError) throw new Error(`コメントの取得に失敗しました: ${commentsError.message}`);

      const commentsList = (comments ?? [])
        .map((c) => `- (${REVIEW_COMMENT_TYPE_LABEL[c.comment_type] ?? c.comment_type}) ${c.body}`)
        .join("\n");

      userPrompt = `テーマ: ${latestVersion.title}\n\n[前回のバージョン本文]\n${latestVersion.body_markdown}\n\n[レビューでの指摘事項]\n${commentsList || "(なし)"}\n\n上記の指摘を踏まえて本文を改善し、新しいバージョンとして書き直してください。`;
      versionNumber = latestVersion.version_number + 1;
    } else {
      userPrompt = `テーマ: ${topic}`;
      versionNumber = 1;
    }

    const content = await callDeepSeekChat(systemPrompt, userPrompt, { timeoutMs: 60_000 });

    const raw = extractJson(content);
    if (!raw) throw new Error(`DeepSeek APIの応答をJSONとして解析できませんでした: ${content.slice(0, 200)}`);

    const generated = normalizeGenerated(raw, contentType);
    if (!generated) throw new Error("生成結果にtitleまたはbody_markdownが含まれていません");

    const { data: newVersion, error: versionError } = await admin
      .from("draft_versions")
      .insert({
        draft_id: job.draft_id,
        version_number: versionNumber,
        title: generated.title,
        body_markdown: generated.body_markdown,
        seo_title: generated.seo_title,
        seo_description: generated.seo_description,
        cta_label: generated.cta_label,
        cta_href: generated.cta_href,
        faq: generated.faq,
        generated_by: "external_llm",
      })
      .select("id")
      .single();

    if (versionError || !newVersion) throw new Error(`下書きバージョンの保存に失敗しました: ${versionError?.message}`);

    await admin.from("drafts").update({ title: generated.title, status: "draft" }).eq("id", job.draft_id);

    await admin
      .from("job_runs")
      .update({
        status: "succeeded",
        result_draft_version_id: newVersion.id,
        output: { title: generated.title },
        processed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    return NextResponse.json({ ok: true, draftVersionId: newVersion.id }, { status: 200 });
  } catch (e) {
    const message = (e as Error).message;
    await admin
      .from("job_runs")
      .update({
        status: "failed",
        error_message: message,
        processed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
