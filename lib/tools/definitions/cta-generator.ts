import { z } from "zod";
import type { ToolDefinition } from "../types";

const GOAL_OPTIONS = [
  { value: "inquiry", label: "お問い合わせを増やしたい" },
  { value: "consultation", label: "無料相談への申し込みを増やしたい" },
  { value: "download", label: "資料ダウンロードを増やしたい" },
  { value: "subscribe", label: "メルマガ登録・フォローを増やしたい" },
] as const;

const InputSchema = z.object({
  productName: z.string().trim().min(1, "商品・サービス名を入力してください").max(40),
  goal: z.enum(["inquiry", "consultation", "download", "subscribe"]),
});

type Input = z.infer<typeof InputSchema>;

const TEMPLATES: Record<(typeof GOAL_OPTIONS)[number]["value"], (name: string) => string[]> = {
  inquiry: (name) => [
    `${name}について問い合わせる`,
    `${name}の詳細を今すぐ相談`,
    "まずはお気軽にご相談ください",
    `${name}について話を聞いてみる`,
  ],
  consultation: (name) => [
    `${name}の無料相談を予約する`,
    "まずは無料相談から",
    `${name}について専門家に無料相談`,
    "30分の無料相談を申し込む",
  ],
  download: (name) => [
    `${name}の資料を無料ダウンロード`,
    "詳しい資料をダウンロードする",
    `${name}の詳細資料を今すぐ入手`,
    "無料資料をメールで受け取る",
  ],
  subscribe: (name) => [
    `${name}の最新情報を受け取る`,
    "無料でメルマガ登録する",
    "最新のお知らせをフォローする",
    `${name}のアップデートを購読`,
  ],
};

export const ctaGenerator: ToolDefinition<Input> = {
  slug: "cta-generator",
  name: "CTA生成",
  shortDescription: "商品・サービス名とゴールから、成果につながるCTAコピー案を生成します。",
  description:
    "商品・サービス名と達成したいゴールを選ぶと、ボタンやリンクにそのまま使えるCTAコピー案を4パターン生成します。",
  eyebrowNum: "CTA",
  fields: [
    { type: "text", name: "productName", label: "商品・サービス名", placeholder: "AI導入支援", required: true },
    { type: "select", name: "goal", label: "達成したいゴール", required: true, options: [...GOAL_OPTIONS] },
  ],
  schema: InputSchema,
  run(input) {
    const candidates = TEMPLATES[input.goal](input.productName);
    return {
      items: candidates,
      note: "ボタンの色・配置・周辺の訴求文言によっても効果は変わります。複数パターンをA/Bテストすることをおすすめします。",
    };
  },
};
