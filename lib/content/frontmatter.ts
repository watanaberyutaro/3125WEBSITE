export type ServiceFrontmatter = {
  title: string;
  seo_title: string | null;
  seo_description: string | null;
  cta_label: string | null;
  cta_href: string | null;
  faq: { question: string; answer: string }[];
  updated_at: string | null;
};

const FRONTMATTER_BLOCK = /^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/;
const SCALAR_LINE = /^([a-z_]+): "(.*)"$/;
const FAQ_QUESTION_LINE = /^  - question: "(.*)"$/;
const FAQ_ANSWER_LINE = /^ {4}answer: "(.*)"$/;

const SCALAR_KEYS = ["title", "seo_title", "seo_description", "cta_label", "cta_href", "updated_at"] as const;
type ScalarKey = (typeof SCALAR_KEYS)[number];

/**
 * lib/admin/publish.ts の yamlEscape() の逆変換。
 * yamlEscapeは「\ を \\ に置換」→「" を \" に置換」の順で適用するため、
 * 逆変換は左から貪欲に走査し「\\」→\、「\"」→" のペアを解決すれば一意に戻る
 * （\\ の生成が先に完了してから \" の挿入が行われるため、曖昧さは生じない）。
 */
function yamlUnescape(value: string): string {
  let result = "";
  for (let i = 0; i < value.length; i++) {
    if (value[i] === "\\" && i + 1 < value.length) {
      const next = value[i + 1];
      if (next === "\\" || next === '"') {
        result += next;
        i++;
        continue;
      }
    }
    result += value[i];
  }
  return result;
}

/**
 * lib/admin/publish.ts の serializeToMarkdown() が出力する既知の固定文法のみを
 * 読み取る専用パーサー。汎用YAMLパーサーは導入しない — writer側の出力形式が
 * ここで想定する形と1文字でもズレたら黙って壊れたデータを描画するのではなく
 * nullを返して呼び出し側にnotFound()させるのが安全なため。
 *
 * 既知の制限: yamlEscape()は改行をエスケープしないため、タイトルやFAQ回答に
 * 改行が含まれる場合は往復変換できない（Phase3のwriter側の既存の制限であり、
 * このフェーズで意図的に手を入れない。該当ケースはnullを返す形で安全側に倒す）。
 */
export function parseFrontmatter(raw: string): { frontmatter: ServiceFrontmatter; body: string } | null {
  const match = FRONTMATTER_BLOCK.exec(raw);
  if (!match) return null;

  const [, frontmatterBlock, body] = match;
  const lines = frontmatterBlock.split("\n");

  const scalars: Partial<Record<ScalarKey, string>> = {};
  const faq: { question: string; answer: string }[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line === "faq:") {
      i++;
      while (i < lines.length) {
        const qMatch = FAQ_QUESTION_LINE.exec(lines[i]);
        if (!qMatch) break;
        const aMatch = i + 1 < lines.length ? FAQ_ANSWER_LINE.exec(lines[i + 1]) : null;
        if (!aMatch) return null;
        faq.push({ question: yamlUnescape(qMatch[1]), answer: yamlUnescape(aMatch[1]) });
        i += 2;
      }
      continue;
    }

    const scalarMatch = SCALAR_LINE.exec(line);
    if (!scalarMatch) return null;
    const [, key, value] = scalarMatch;
    if (!(SCALAR_KEYS as readonly string[]).includes(key)) return null;
    scalars[key as ScalarKey] = yamlUnescape(value);
    i++;
  }

  if (!scalars.title) return null;

  return {
    frontmatter: {
      title: scalars.title,
      seo_title: scalars.seo_title ?? null,
      seo_description: scalars.seo_description ?? null,
      cta_label: scalars.cta_label ?? null,
      cta_href: scalars.cta_href ?? null,
      faq,
      updated_at: scalars.updated_at ?? null,
    },
    body,
  };
}
