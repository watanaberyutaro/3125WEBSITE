"use client";

import { useActionState } from "react";
import { ImageUploader } from "./ImageUploader";
import type { WorkActionState } from "@/lib/admin/works-actions";

type CategoryOption = { id: string; name: string; slug: string };

type WorkDefaults = {
  id?: string;
  slug?: string;
  client_name?: string;
  project_name?: string;
  category_id?: string;
  industry_id?: string | null;
  year?: string | null;
  excerpt?: string | null;
  description?: string | null;
  external_link?: string | null;
  cover_image_path?: string | null;
  tags?: string[];
  scope?: string | null;
  category_label?: string | null;
  status?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_path?: string | null;
  sort_order?: number;
};

const inputClass = "border border-line bg-bg px-3 py-2 text-[13px] text-text outline-none focus:border-green";
const labelClass = "font-mono text-[11px] tracking-[0.06em] text-text-3 uppercase";

export function WorkForm({
  action,
  categories,
  industries,
  defaults,
  submitLabel,
}: {
  action: (state: WorkActionState, formData: FormData) => Promise<WorkActionState>;
  categories: CategoryOption[];
  industries: CategoryOption[];
  defaults?: WorkDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="client_name">
            クライアント名 *
          </label>
          <input
            id="client_name"
            name="client_name"
            required
            defaultValue={defaults?.client_name}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="project_name">
            案件名 *
          </label>
          <input
            id="project_name"
            name="project_name"
            required
            defaultValue={defaults?.project_name}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="slug">
          スラッグ（空欄で自動生成、公開後の変更はURLが変わるため非推奨）
        </label>
        <input id="slug" name="slug" defaultValue={defaults?.slug} className={inputClass} placeholder="work-08" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          <label className={labelClass} htmlFor="industry_id">
            業種
          </label>
          <select id="industry_id" name="industry_id" defaultValue={defaults?.industry_id ?? ""} className={inputClass}>
            <option value="">未設定</option>
            {industries.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="year">
            年
          </label>
          <input id="year" name="year" defaultValue={defaults?.year ?? ""} className={inputClass} placeholder="2026" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="category_label">
          Category表示ラベル（空欄ならカテゴリ名をそのまま使用。詳細ページのサイドバー表示用）
        </label>
        <input
          id="category_label"
          name="category_label"
          defaultValue={defaults?.category_label ?? ""}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="scope">
          Scope（例: 企画 / 撮影 / 編集）
        </label>
        <input id="scope" name="scope" defaultValue={defaults?.scope ?? ""} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="excerpt">
          概要（一覧・検索結果用の短文）
        </label>
        <input id="excerpt" name="excerpt" defaultValue={defaults?.excerpt ?? ""} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="description">
          Overview本文（詳細ページに表示。改行で段落分け）
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          defaultValue={defaults?.description ?? ""}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="tags">
          タグ（カンマ区切り）
        </label>
        <input
          id="tags"
          name="tags"
          defaultValue={defaults?.tags?.join(", ") ?? ""}
          className={inputClass}
          placeholder="Webデザイン, ブランディング"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="external_link">
          外部URL（任意。指定すると詳細ページに「URL」欄として表示）
        </label>
        <input
          id="external_link"
          name="external_link"
          defaultValue={defaults?.external_link ?? ""}
          className={inputClass}
          placeholder="https://example.com"
        />
      </div>

      <ImageUploader bucket="works-images" name="cover_image_path" defaultPath={defaults?.cover_image_path} label="サムネイル画像" />
      <ImageUploader bucket="og-images" name="og_image_path" defaultPath={defaults?.og_image_path} label="OGP画像（空欄ならサムネイル画像を使用）" />

      <div className="grid grid-cols-1 gap-4 border-t border-line pt-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="seo_title">
            SEOタイトル（空欄なら自動生成）
          </label>
          <input id="seo_title" name="seo_title" defaultValue={defaults?.seo_title ?? ""} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="sort_order">
            表示順
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            min={0}
            defaultValue={defaults?.sort_order ?? 0}
            className={inputClass}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="seo_description">
          SEO description（空欄なら概要を使用）
        </label>
        <textarea
          id="seo_description"
          name="seo_description"
          rows={2}
          defaultValue={defaults?.seo_description ?? ""}
          className={inputClass}
        />
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
