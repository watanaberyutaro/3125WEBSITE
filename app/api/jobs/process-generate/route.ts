import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
// DeepSeek APIは実測で1リクエスト(全フィールド生成)あたり10秒未満で完了する。
// 60秒のDEEPSEEK_TIMEOUT_MS + DB往復分の余裕を見て設定。
export const maxDuration = 90;

/**
 * job_runsのkind='generate'のうちinput.source==='llm'のものが、
 * 0010_llm_generate_trigger.sqlのpg_netトリガー経由でここに到達する。
 *
 * 当初はユーザー自身のAI Gateway(Cloudflare Tunnel経由・自宅PCのLM Studioで
 * ローカル推論モデルgpt-oss-20bを実行)を呼ぶ設計だったが、実測でCloudflareの
 * エッジがプロキシ済みトラフィックを約100〜125秒で強制切断すること、かつ
 * 推論モデル自体の応答（本文生成のみでも）が90秒を超えることが多く、
 * 確実な生成が困難だったため、DeepSeek API(https://api.deepseek.com)へ
 * 切り替えた。DeepSeekは実測で1リクエスト(title+body+seo+faq+cta全フィールド)
 * あたり10秒未満で完了し、コストも1回あたり$0.001未満と無視できる水準
 * （2026-07時点の公式料金より試算。要最新料金確認）。
 */
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";
const DEEPSEEK_TIMEOUT_MS = 60_000;

const ARTICLE_SCHEMA_HINT = `{"title":"string","body_markdown":"string (Markdown形式、600〜900字程度、見出しを含む)","seo_title":"string (60字以内)","seo_description":"string (160字以内)","faq":[{"question":"string","answer":"string"}] (0〜3件)}`;
const SERVICE_PAGE_SCHEMA_HINT = `{"title":"string","body_markdown":"string (Markdown形式、600〜900字程度、見出しを含む)","seo_title":"string (60字以内)","seo_description":"string (160字以内)","cta_label":"string (行動喚起ボタンの文言)","faq":[{"question":"string","answer":"string"}] (0〜3件)}`;

function buildSystemPrompt(contentType: string): string {
  const schema = contentType === "service_page" ? SERVICE_PAGE_SCHEMA_HINT : ARTICLE_SCHEMA_HINT;
  return `あなたはSEOコンテンツ作成のアシスタントです。必ず以下のJSON形式のみで出力してください。前置き・説明文・マークダウンのコードフェンスは一切不要です。JSON以外の文字を出力しないでください。\n\n${schema}`;
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

  const input = job.input as { topic?: string; content_type?: string } | null;
  const topic = input?.topic;
  const contentType = input?.content_type;

  if (!topic || !contentType) {
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
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error("DEEPSEEK_API_KEYが設定されていません");

    let res: Response;
    try {
      res = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: [
            { role: "system", content: buildSystemPrompt(contentType) },
            { role: "user", content: `テーマ: ${topic}` },
          ],
        }),
        signal: AbortSignal.timeout(DEEPSEEK_TIMEOUT_MS),
      });
    } catch (e) {
      if (e instanceof Error && e.name === "TimeoutError") throw new Error("DeepSeek APIの応答がタイムアウトしました");
      throw e;
    }

    if (!res.ok) throw new Error(`DeepSeek APIがエラーを返しました (${res.status})`);

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("DeepSeek APIのレスポンス形式が想定外です");

    const raw = extractJson(content);
    if (!raw) throw new Error(`DeepSeek APIの応答をJSONとして解析できませんでした: ${content.slice(0, 200)}`);

    const generated = normalizeGenerated(raw, contentType);
    if (!generated) throw new Error("生成結果にtitleまたはbody_markdownが含まれていません");

    const { data: newVersion, error: versionError } = await admin
      .from("draft_versions")
      .insert({
        draft_id: job.draft_id,
        version_number: 1,
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
