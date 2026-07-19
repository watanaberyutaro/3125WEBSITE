"use client";

import { useActionState, useState } from "react";
import { runGenerateWithAI, type GenerateWithAIState } from "@/lib/admin/jobs-actions";

const CONTENT_TYPE_OPTIONS = [
  { value: "article", label: "記事" },
  { value: "service_page", label: "サービスページ" },
];

const inputClass = "border border-line bg-bg px-3 py-2 text-[13px] text-text outline-none focus:border-green";
const labelClass = "font-mono text-[11px] tracking-[0.06em] text-text-3 uppercase";

/**
 * トピック/ブリーフを入力するだけの最小フォーム。DraftForm.tsxとは別に
 * 新設した — 全項目入力を要求する既存フォームとは目的が異なるため
 * （ここではAIに本文・SEO項目・FAQ等を生成させる）。
 */
export function GenerateDraftForm() {
  const [state, formAction, pending] = useActionState<GenerateWithAIState, FormData>(runGenerateWithAI, undefined);
  const [contentType, setContentType] = useState("article");

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="content_type">
          種別 *
        </label>
        <select
          id="content_type"
          name="content_type"
          required
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          className={inputClass}
        >
          {CONTENT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {contentType === "service_page" && (
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="target_path">
            公開先パス * （例: content/services/ai-training.md）
          </label>
          <input id="target_path" name="target_path" className={inputClass} placeholder="content/services/..." />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="topic">
          テーマ・ブリーフ *
        </label>
        <textarea
          id="topic"
          name="topic"
          required
          rows={4}
          className={`${inputClass} font-mono`}
          placeholder="例: AI導入における中小企業の注意点について"
        />
        <p className="text-[12px] text-text-3">
          AI Gatewayでの生成には数十秒〜数分かかります。送信後、下書き詳細画面で進捗を確認できます。
        </p>
      </div>

      {state?.error && (
        <p className="text-[13px] text-[#b3432b]" role="alert">
          {state.error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="bg-green px-6 py-3 font-mono text-[12px] tracking-[0.08em] text-white uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "送信中…" : "AIで生成する"}
        </button>
      </div>
    </form>
  );
}
