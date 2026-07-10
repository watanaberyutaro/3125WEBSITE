import { z } from "zod";
import type { ToolDefinition } from "../types";

const InputSchema = z.object({
  title: z.string().trim().min(1, "ページタイトルを入力してください").max(60),
  appeal: z.string().trim().min(1, "訴求ポイントを入力してください").max(80),
});

type Input = z.infer<typeof InputSchema>;

const MAX_LENGTH = 120;

function truncate(text: string): string {
  return text.length > MAX_LENGTH ? `${text.slice(0, MAX_LENGTH - 1)}…` : text;
}

const CTA_PHRASES = ["詳しくはこちら", "無料相談受付中", "今すぐチェック", "お気軽にお問い合わせください"];

export const metaDescriptionGenerator: ToolDefinition<Input> = {
  slug: "meta-description-generator",
  name: "メタディスクリプション生成",
  shortDescription: "ページタイトルと訴求ポイントから、検索結果に表示される説明文を生成します。",
  description:
    "ページタイトルと伝えたい訴求ポイントを入力すると、検索結果のスニペットに使える説明文を3パターン生成します。全角120文字前後を目安に調整しています。",
  eyebrowNum: "Meta",
  fields: [
    { type: "text", name: "title", label: "ページタイトル", placeholder: "AI導入支援サービス", required: true },
    {
      type: "textarea",
      name: "appeal",
      label: "訴求ポイント・強み",
      placeholder: "戦略策定から運用定着まで一貫サポート",
      required: true,
    },
  ],
  schema: InputSchema,
  run(input) {
    const { title, appeal } = input;

    const candidates = [
      `${title}なら3125株式会社。${appeal}。${CTA_PHRASES[0]}。`,
      `${appeal}——${title}を専門チームがサポートします。${CTA_PHRASES[1]}。`,
      `${title}でお悩みの方へ。${appeal}。${CTA_PHRASES[3]}`,
    ].map(truncate);

    return {
      items: candidates,
      note: "全角120文字前後（PC検索結果で途切れにくい目安）に自動調整しています。",
    };
  },
};
