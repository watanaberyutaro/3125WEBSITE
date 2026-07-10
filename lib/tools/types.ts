import type { z } from "zod";

export type ToolField =
  | { type: "text"; name: string; label: string; placeholder?: string; required?: boolean }
  | { type: "textarea"; name: string; label: string; placeholder?: string; required?: boolean }
  | { type: "select"; name: string; label: string; options: { value: string; label: string }[]; required?: boolean }
  | {
      type: "checkboxes";
      name: string;
      label: string;
      options: { value: string; label: string }[];
    };

/**
 * 全ツール共通の出力形。ツールごとに使うフィールドだけを埋める。
 * ToolResult コンポーネント側はこの形に沿って汎用的にレンダリングする。
 */
export type ToolOutput = {
  summary?: string;
  items?: string[];
  qa?: { question: string; answer: string }[];
  priceRange?: { min: number; max: number; note?: string };
  note?: string;
};

export type ToolDefinition<TInput = Record<string, unknown>> = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  eyebrowNum: string;
  fields: ToolField[];
  schema: z.ZodType<TInput>;
  run: (input: TInput) => ToolOutput;
};
