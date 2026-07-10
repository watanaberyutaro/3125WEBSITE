import { z } from "zod";
import type { ToolDefinition } from "../types";

const InputSchema = z.object({
  topic: z.string().trim().min(1, "サービス・商品名を入力してください").max(40),
  industry: z.string().trim().max(40).optional().default(""),
});

type Input = z.infer<typeof InputSchema>;

export const faqGenerator: ToolDefinition<Input> = {
  slug: "faq-generator",
  name: "FAQ生成",
  shortDescription: "サービス名を入力すると、よくある質問と回答の下書きを自動生成します。",
  description:
    "サービス・商品名を入力すると、導入検討者から実際によく聞かれる質問とその回答の下書きを5つ生成します。文面はそのまま公開せず、実情に合わせて調整してご利用ください。",
  eyebrowNum: "FAQ",
  fields: [
    { type: "text", name: "topic", label: "サービス・商品名", placeholder: "AI導入支援", required: true },
    { type: "text", name: "industry", label: "業種（任意）", placeholder: "製造業" },
  ],
  schema: InputSchema,
  run(input) {
    const { topic } = input;
    const industryPart = input.industry ? `${input.industry}に限らず幅広い業種で` : "業種を問わず";

    return {
      qa: [
        {
          question: `${topic}の費用はどれくらいかかりますか？`,
          answer: `内容や規模によって異なりますが、まずは無料相談で概算のお見積もりをご案内しています。料金シミュレーターでも目安をご確認いただけます。`,
        },
        {
          question: `${topic}の導入・完了までにどれくらいの期間がかかりますか？`,
          answer: `ご要望の規模により変動しますが、目安として打ち合わせから1〜2ヶ月程度でご案内するケースが多くなっています。詳細なスケジュールはヒアリング後にご提案します。`,
        },
        {
          question: `${topic}は${industryPart}対応可能ですか？`,
          answer: `はい、対応可能です。業種特有の課題や制約についても事前のヒアリングで丁寧に確認し、最適な進め方をご提案します。`,
        },
        {
          question: `${topic}を初めて依頼しますが、何を準備すればよいですか？`,
          answer: `特別な準備は不要です。現状の課題やゴールイメージをお聞かせいただければ、こちらから必要な項目を整理してご案内します。`,
        },
        {
          question: `${topic}導入後のサポートはありますか？`,
          answer: `納品・導入後も運用状況の確認やご相談に対応しています。継続的なサポートをご希望の場合は、その旨をお問い合わせ時にお知らせください。`,
        },
      ],
      note: "生成された内容は下書きです。実際の実績・条件に合わせて必ず内容を確認・編集してから公開してください。",
    };
  },
};
