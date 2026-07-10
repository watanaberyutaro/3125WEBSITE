import { z } from "zod";
import type { ToolDefinition } from "../types";

const SERVICE_OPTIONS = [
  { value: "video", label: "映像制作" },
  { value: "web", label: "Webサイト制作" },
  { value: "education", label: "AIマンツーマン教育" },
  { value: "implementation", label: "AI導入支援" },
  { value: "training", label: "AI研修・ワークショップ" },
  { value: "content", label: "AIコンテンツ制作" },
] as const;

const SCALE_OPTIONS = [
  { value: "small", label: "小規模（個人・小チーム向け）" },
  { value: "medium", label: "中規模（部署・中小企業向け）" },
  { value: "large", label: "大規模（全社・複数部署向け）" },
] as const;

const OPTION_CHOICES = [
  { value: "rush", label: "特急対応（納期を短縮したい）" },
  { value: "multilingual", label: "多言語対応が必要" },
  { value: "ongoing", label: "継続的な運用・保守サポートが欲しい" },
] as const;

const BASE_PRICE: Record<(typeof SERVICE_OPTIONS)[number]["value"], { min: number; max: number }> = {
  video: { min: 300_000, max: 1_000_000 },
  web: { min: 400_000, max: 1_500_000 },
  education: { min: 100_000, max: 300_000 },
  implementation: { min: 300_000, max: 1_000_000 },
  training: { min: 150_000, max: 500_000 },
  content: { min: 100_000, max: 400_000 },
};

const SCALE_MULTIPLIER: Record<(typeof SCALE_OPTIONS)[number]["value"], number> = {
  small: 1,
  medium: 1.6,
  large: 2.5,
};

const InputSchema = z.object({
  service: z.enum(["video", "web", "education", "implementation", "training", "content"]),
  scale: z.enum(["small", "medium", "large"]),
  options: z.array(z.enum(["rush", "multilingual", "ongoing"])).default([]),
});

type Input = z.infer<typeof InputSchema>;

function roundTo(value: number, unit: number): number {
  return Math.round(value / unit) * unit;
}

export const pricingSimulator: ToolDefinition<Input> = {
  slug: "pricing-simulator",
  name: "料金シミュレーター",
  shortDescription: "サービス内容・規模から概算費用の目安をその場で算出します。",
  description:
    "ご依頼予定のサービス・規模・オプションを選択すると、費用の目安レンジをその場で算出します。正式なお見積もりはお問い合わせよりご相談ください。",
  eyebrowNum: "Est",
  fields: [
    { type: "select", name: "service", label: "サービス内容", required: true, options: [...SERVICE_OPTIONS] },
    { type: "select", name: "scale", label: "規模感", required: true, options: [...SCALE_OPTIONS] },
    { type: "checkboxes", name: "options", label: "該当するオプション（複数選択可）", options: [...OPTION_CHOICES] },
  ],
  schema: InputSchema,
  run(input) {
    const base = BASE_PRICE[input.service];
    const multiplier = SCALE_MULTIPLIER[input.scale];
    let min = base.min * multiplier;
    let max = base.max * multiplier;

    const noteParts: string[] = [];
    if (input.options.includes("rush")) {
      min *= 1.2;
      max *= 1.2;
      noteParts.push("特急対応により通常より+20%程度を見込んでいます");
    }
    if (input.options.includes("multilingual")) {
      min += 150_000;
      max += 150_000;
      noteParts.push("多言語対応により+15万円を加算しています");
    }
    if (input.options.includes("ongoing")) {
      noteParts.push("継続運用・保守は別途月額8万円〜が目安です（上記レンジには含まれません）");
    }

    return {
      priceRange: {
        min: roundTo(min, 10_000),
        max: roundTo(max, 10_000),
        note: noteParts.length > 0 ? noteParts.join("／") : undefined,
      },
      note: "あくまで概算の目安です。要件によって前後しますので、正式なお見積もりはお問い合わせフォームよりご相談ください。",
    };
  },
};
