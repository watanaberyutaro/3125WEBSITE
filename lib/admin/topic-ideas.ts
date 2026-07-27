const IDEA_COUNT = 5;

/**
 * 記事ネタ生成用のsystem prompt。既存の公開記事タイトル・未消化の企画タイトルを
 * 「避けるべきリスト」として渡すことで重複を防ぐ（rejection_rulesをプロンプトに
 * 注入する既存パターンと同じ考え方）。
 */
export function buildTopicIdeaSystemPrompt(excludeTitles: string[], rules: string[]): string {
  const excludeBlock =
    excludeTitles.length > 0
      ? excludeTitles.map((t) => `- ${t}`).join("\n")
      : "（まだありません）";

  let prompt = `あなたは3125株式会社（AI導入支援・Web制作会社）のオウンドメディア編集者です。
「NEWS」に掲載する新しい記事の企画を${IDEA_COUNT}件考えてください。

出力は必ずJSON配列のみとしてください（説明文やコードブロックは不要です）。各要素は次の形式です:
[{"title": "記事タイトル（30字程度）", "brief": "企画概要。誰向けにどんな内容を書くか、150字程度で"}]

次のタイトルは既に公開済み、または企画済みのため、内容が重複しないようにしてください:
${excludeBlock}`;

  if (rules.length > 0) {
    prompt += `\n\n過去の差し戻しから学んだ注意点:\n${rules.map((r) => `- ${r}`).join("\n")}`;
  }

  return prompt;
}

export const TOPIC_IDEA_USER_PROMPT = `${IDEA_COUNT}件、記事の企画を提案してください。`;

export type TopicIdea = { title: string; brief: string };

/**
 * DeepSeekのレスポンス(JSON配列を期待するが、コードフェンスや前後の説明文が
 * 混ざることがある)からタイトル+概要のペアを抽出する。process-generate/route.ts
 * のextractJsonと同じ考え方(フェンス除去→最初/最後の括弧で切り出し)だが、
 * 対象がオブジェクトではなく配列なため独立して実装する。
 */
export function parseTopicIdeas(raw: string): TopicIdea[] {
  let text = raw.trim();
  const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenceMatch) text = fenceMatch[1].trim();

  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      title: typeof item.title === "string" ? item.title.trim() : "",
      brief: typeof item.brief === "string" ? item.brief.trim() : "",
    }))
    .filter((item) => item.title.length > 0 && item.brief.length > 0)
    .slice(0, IDEA_COUNT);
}
