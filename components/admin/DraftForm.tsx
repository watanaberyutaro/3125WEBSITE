"use client";

import { useActionState } from "react";
import type { DraftActionState } from "@/lib/admin/drafts-actions";

const CONTENT_TYPE_OPTIONS = [
  { value: "article", label: "記事" },
  { value: "service_page", label: "サービスページ" },
  { value: "cta_copy", label: "CTA文言" },
  { value: "faq", label: "FAQ" },
  { value: "landing_page", label: "ランディングページ" },
  { value: "other", label: "その他" },
];

type DraftFormDefaults = {
  draftId?: string;
  content_type?: string;
  target_path?: string;
  title?: string;
  body_markdown?: string;
  seo_title?: string;
  seo_description?: string;
  faq?: string;
  cta_label?: string;
  cta_href?: string;
};

const inputClass = "border border-line bg-bg px-3 py-2 text-[13px] text-text outline-none focus:border-green";
const labelClass = "font-mono text-[11px] tracking-[0.06em] text-text-3 uppercase";

/**
 * 下書きの新規作成・新バージョン追加の両方で使う共通フォーム。
 * content_type/target_pathは新規作成時のみ表示（バージョン追加時は
 * 既存drafts行のcontent_typeを変更させないため）。
 */
export function DraftForm({
  action,
  defaults,
  submitLabel,
  isNewDraft,
}: {
  action: (state: DraftActionState, formData: FormData) => Promise<DraftActionState>;
  defaults?: DraftFormDefaults;
  submitLabel: string;
  isNewDraft: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6">
      {defaults?.draftId && <input type="hidden" name="draftId" value={defaults.draftId} />}

      {isNewDraft && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="content_type">
              種別 *
            </label>
            <select
              id="content_type"
              name="content_type"
              required
              defaultValue={defaults?.content_type ?? "article"}
              className={inputClass}
            >
              {CONTENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="target_path">
              想定パス（任意。例: /column/ai-training-guide）
            </label>
            <input
              id="target_path"
              name="target_path"
              defaultValue={defaults?.target_path ?? ""}
              className={inputClass}
              placeholder="/column/..."
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="title">
          タイトル *
        </label>
        <input id="title" name="title" required defaultValue={defaults?.title} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="body_markdown">
          本文（Markdown）
        </label>
        <textarea
          id="body_markdown"
          name="body_markdown"
          rows={16}
          defaultValue={defaults?.body_markdown ?? ""}
          className={`${inputClass} font-mono`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="faq">
          FAQ（任意。「Q: 質問」「A: 回答」を1組として空行で区切って入力）
        </label>
        <textarea
          id="faq"
          name="faq"
          rows={5}
          defaultValue={defaults?.faq ?? ""}
          className={`${inputClass} font-mono`}
          placeholder={"Q: 導入にどれくらいかかりますか？\nA: 通常1〜2ヶ月です。"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="cta_label">
            CTA文言（任意）
          </label>
          <input id="cta_label" name="cta_label" defaultValue={defaults?.cta_label ?? ""} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="cta_href">
            CTA遷移先（任意）
          </label>
          <input
            id="cta_href"
            name="cta_href"
            defaultValue={defaults?.cta_href ?? ""}
            className={inputClass}
            placeholder="/contact"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-line pt-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="seo_title">
            SEOタイトル（任意）
          </label>
          <input id="seo_title" name="seo_title" defaultValue={defaults?.seo_title ?? ""} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="seo_description">
            SEO description（任意）
          </label>
          <input
            id="seo_description"
            name="seo_description"
            defaultValue={defaults?.seo_description ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      {state?.error && (
        <p className="text-[13px] text-[#b3432b]" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-green px-6 py-3 font-mono text-[12px] tracking-[0.08em] text-white uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "保存中…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
