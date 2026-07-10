import { z } from "zod";
import type { ToolDefinition } from "../types";

const InputSchema = z.object({
  keyword: z.string().trim().min(1, "キーワードを入力してください").max(40),
  audience: z.string().trim().max(60).optional().default(""),
});

type Input = z.infer<typeof InputSchema>;

const MAX_LENGTH = 32;

function truncate(text: string): string {
  return text.length > MAX_LENGTH ? `${text.slice(0, MAX_LENGTH - 1)}…` : text;
}

export const seoTitleGenerator: ToolDefinition<Input> = {
  slug: "seo-title-generator",
  name: "SEOタイトル生成",
  shortDescription: "キーワードを入力するだけで、クリックされやすいSEOタイトル案を複数生成します。",
  description:
    "対策したいキーワードを入力すると、検索結果でクリックされやすいタイトル案を5パターン提示します。全角32文字前後を目安に自動調整しています。",
  eyebrowNum: "Title",
  fields: [
    { type: "text", name: "keyword", label: "対策キーワード", placeholder: "AI導入支援", required: true },
    { type: "text", name: "audience", label: "想定読者（任意）", placeholder: "中小企業の経営者" },
  ],
  schema: InputSchema,
  run(input) {
    const { keyword } = input;
    const audiencePart = input.audience ? `${input.audience}向け` : "";

    const candidates = [
      `${keyword}とは？基礎から実践までわかりやすく解説`,
      `${audiencePart}${keyword}の始め方｜メリットと注意点まとめ`,
      `【保存版】${keyword}を成功させる5つのポイント`,
      `${keyword}でよくある失敗と対策｜プロが解説`,
      `今さら聞けない${keyword}｜${audiencePart || "初心者"}向け完全ガイド`,
    ].map(truncate);

    return {
      items: candidates,
      note: "全角32文字前後（検索結果で途切れにくい目安）に自動調整しています。実際の表示幅は端末により変動します。",
    };
  },
};
