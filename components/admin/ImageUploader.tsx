"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { resolveImageUrl } from "@/lib/media";

type Bucket = "works-images" | "article-images" | "og-images";

/**
 * 画像アップロード。管理者としてログイン済みのブラウザセッションから
 * Supabase Storageへ直接アップロードする(サーバーを経由しないため、
 * 旧PHPサイトで起きた8MBアップロード上限のような問題が構造的に起きない)。
 * アップロード結果のパスをhidden inputへセットし、フォーム送信時に
 * Server Actionへ渡す。
 */
export function ImageUploader({
  bucket,
  name,
  defaultPath,
  label,
}: {
  bucket: Bucket;
  name: string;
  defaultPath?: string | null;
  label: string;
}) {
  const [path, setPath] = useState(defaultPath ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const previewUrl = path ? resolveImageUrl(path, bucket) : null;

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const ext = file.name.split(".").pop() ?? "jpg";
    const objectPath = `${crypto.randomUUID()}.${ext}`;

    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(objectPath, file, { contentType: file.type, upsert: false });

    setUploading(false);

    if (uploadError) {
      setError(`アップロード失敗: ${uploadError.message}`);
      return;
    }
    setPath(objectPath);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[11px] tracking-[0.06em] text-text-3 uppercase">{label}</span>
      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- アップロード直後のプレビュー用。next/imageのremotePatterns解決を待たず即座に表示する
        <img src={previewUrl} alt="プレビュー" className="h-32 w-auto border border-line object-cover" />
      )}
      <input type="hidden" name={name} value={path} />
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleChange}
        disabled={uploading}
        className="text-[13px]"
      />
      {uploading && <p className="text-[12px] text-text-3">アップロード中…</p>}
      {error && <p className="text-[12px] text-[#b3432b]">{error}</p>}
    </div>
  );
}
