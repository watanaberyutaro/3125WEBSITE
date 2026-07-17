"use client";

import { useEffect, useState } from "react";
import { DraftVersionDiff } from "./DraftVersionDiff";

type Version = {
  id: string;
  version_number: number;
  title: string;
  body_markdown: string;
  seo_title: string | null;
  seo_description: string | null;
  cta_label: string | null;
  cta_href: string | null;
  generated_by: string;
  created_at: string;
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * バージョン一覧(新しい順に受け取る) + 選択中バージョンのプレビュー・前バージョンとの差分。
 * versionsは getAdminDraftWithHistory がversion_number降順で返す前提。
 */
export function DraftVersionHistory({ versions }: { versions: Version[] }) {
  const [selectedId, setSelectedId] = useState(versions[0]?.id);

  // 新バージョン追加後、同一URL(/admin/drafts/[id])へredirectするとNext.jsが
  // このコンポーネントを再マウントせず再利用するため、useStateの初期値だけでは
  // 選択中バージョンが更新されない。最新バージョンのidが変わった時だけ選択し直す
  // （ユーザーが手動で過去バージョンを選んでいる間は上書きしない）。
  useEffect(() => {
    setSelectedId(versions[0]?.id);
  }, [versions]);

  const selectedIndex = versions.findIndex((v) => v.id === selectedId);
  const selected = versions[selectedIndex];
  const previous = versions[selectedIndex + 1]; // 配列は新しい順なので次要素が1つ前のバージョン

  if (!selected) return null;

  return (
    <div className="flex flex-col gap-4">
      {versions.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {versions.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedId(v.id)}
              className="px-3 py-1.5 font-mono text-[11px] tracking-[0.04em] transition-colors"
              style={{
                border: `1px solid ${v.id === selectedId ? "var(--green)" : "var(--line)"}`,
                color: v.id === selectedId ? "var(--green)" : "var(--text-3)",
                background: v.id === selectedId ? "var(--green-4)" : "transparent",
              }}
            >
              v{v.version_number}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-text-3">
        <span>v{selected.version_number}</span>
        <span>{formatDateTime(selected.created_at)}</span>
        <span className="uppercase">{selected.generated_by}</span>
      </div>

      <div>
        <p className="mb-1 font-mono text-[11px] tracking-[0.06em] text-text-3 uppercase">タイトル</p>
        <p className="text-[15px] font-bold text-text">{selected.title}</p>
      </div>

      <div>
        <p className="mb-1 font-mono text-[11px] tracking-[0.06em] text-text-3 uppercase">
          本文{previous ? `（v${previous.version_number}からの差分）` : ""}
        </p>
        {previous ? (
          <DraftVersionDiff oldText={previous.body_markdown} newText={selected.body_markdown} />
        ) : (
          <div className="whitespace-pre-wrap border border-line bg-bg p-4 text-[13px] leading-relaxed text-text">
            {selected.body_markdown || "（本文なし）"}
          </div>
        )}
      </div>

      {(selected.cta_label || selected.cta_href) && (
        <div>
          <p className="mb-1 font-mono text-[11px] tracking-[0.06em] text-text-3 uppercase">CTA</p>
          <p className="text-[13px] text-text-2">
            {selected.cta_label} {selected.cta_href && `→ ${selected.cta_href}`}
          </p>
        </div>
      )}

      {(selected.seo_title || selected.seo_description) && (
        <div>
          <p className="mb-1 font-mono text-[11px] tracking-[0.06em] text-text-3 uppercase">SEO</p>
          <p className="text-[13px] text-text-2">{selected.seo_title}</p>
          <p className="text-[13px] text-text-3">{selected.seo_description}</p>
        </div>
      )}
    </div>
  );
}
