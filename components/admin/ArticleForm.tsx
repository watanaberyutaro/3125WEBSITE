"use client";

import { useActionState } from "react";
import { ImageUploader } from "./ImageUploader";
import type { ArticleActionState } from "@/lib/admin/articles-actions";

type CategoryOption = { id: string; name: string; slug: string };

type ArticleDefaults = {
  id?: string;
  slug?: string;
  title?: string;
  excerpt?: string | null;
  body_markdown?: string;
  category_id?: string;
  cover_image_path?: string | null;
  og_image_path?: string | null;
  source_link?: string | null;
  tags?: string;
  faq?: string;
  status?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  reading_minutes?: number;
};

const inputClass = "border border-line bg-bg px-3 py-2 text-[13px] text-text outline-none focus:border-green";
const labelClass = "font-mono text-[11px] tracking-[0.06em] text-text-3 uppercase";

export function ArticleForm({
  action,
  categories,
  defaults,
  submitLabel,
}: {
  action: (state: ArticleActionState, formData: FormData) => Promise<ArticleActionState>;
  categories: CategoryOption[];
  defaults?: ArticleDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="title">
          タイトル *
        </label>
        <input id="title" name="title" required defaultValue={defaults?.title} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="slug">
          スラッグ（空欄で自動生成、公開後の変更はURLが変わるため非推奨）
        </label>
        <input id="slug" name="slug" defaultValue={defaults?.slug} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="category_id">
            カテゴリ *
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            defaultValue={defaults?.category_id}
            className={inputClass}
          >
            <option value="" disabled>
              選択してください
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="reading_minutes">
            読了目安（分）
          </label>
          <input
            id="reading_minutes"
            name="reading_minutes"
            type="number"
            min={1}
            defaultValue={defaults?.reading_minutes ?? 3}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="excerpt">
          抜粋（一覧・検索結果・SEO descriptionのフォールバックに使用）
        </label>
        <input id="excerpt" name="excerpt" defaultValue={defaults?.excerpt ?? ""} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="body_markdown">
          本文（Markdown。## / ### で見出しを付けると目次に自動反映されます）
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
        <label className={labelClass} htmlFor="tags">
          タグ（カンマ区切り。未登録の名前は自動作成されます）
        </label>
        <input id="tags" name="tags" defaultValue={defaults?.tags ?? ""} className={inputClass} placeholder="AI活用, 業務効率化" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="faq">
          FAQ（任意。「Q: 質問」「A: 回答」を1組として空行で区切って入力）
        </label>
        <textarea
          id="faq"
          name="faq"
          rows={6}
          defaultValue={defaults?.faq ?? ""}
          className={`${inputClass} font-mono`}
          placeholder={"Q: 導入にどれくらいかかりますか？\nA: 通常1〜2ヶ月です。"}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="source_link">
          元記事URL（任意。外部ソースへのリンクとして本文末に表示）
        </label>
        <input id="source_link" name="source_link" defaultValue={defaults?.source_link ?? ""} className={inputClass} />
      </div>

      <ImageUploader
        bucket="article-images"
        name="cover_image_path"
        defaultPath={defaults?.cover_image_path}
        label="カバー画像"
      />
      <ImageUploader
        bucket="og-images"
        name="og_image_path"
        defaultPath={defaults?.og_image_path}
        label="OGP画像（空欄ならカバー画像を使用）"
      />

      <div className="flex flex-col gap-4 border-t border-line pt-6">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="seo_title">
            SEOタイトル（空欄ならタイトルを使用）
          </label>
          <input id="seo_title" name="seo_title" defaultValue={defaults?.seo_title ?? ""} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="seo_description">
            SEO description（空欄なら抜粋を使用）
          </label>
          <textarea
            id="seo_description"
            name="seo_description"
            rows={2}
            defaultValue={defaults?.seo_description ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 border-t border-line pt-6">
        <label className={labelClass} htmlFor="status">
          公開状態
        </label>
        <select id="status" name="status" defaultValue={defaults?.status ?? "draft"} className={inputClass}>
          <option value="draft">下書き</option>
          <option value="published">公開</option>
        </select>
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
