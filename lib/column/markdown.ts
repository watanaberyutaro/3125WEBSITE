import { marked } from "marked";

export type Heading = { id: string; text: string; level: 2 | 3 };

function slugifyHeading(text: string, seen: Map<string, number>): string {
  const base =
    text
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "section";
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

/**
 * 記事本文(Markdown)をHTMLへ変換し、目次生成用の見出し一覧を同時に抽出する。
 * 本文は管理画面(staffのみ・service role経由)からしか書き込まれない前提のため、
 * 追加のサニタイズは行わない。
 */
export function renderArticleBody(markdown: string): { html: string; headings: Heading[] } {
  if (!markdown.trim()) return { html: "", headings: [] };

  const tokens = marked.lexer(markdown);
  const headings: Heading[] = [];
  const seen = new Map<string, number>();

  const renderer = new marked.Renderer();
  renderer.heading = ({ text, depth }) => {
    const id = slugifyHeading(text, seen);
    if (depth === 2 || depth === 3) {
      headings.push({ id, text, level: depth });
    }
    return `<h${depth} id="${id}">${text}</h${depth}>\n`;
  };

  const html = marked.parser(tokens, { renderer }) as string;
  return { html, headings };
}
