"use client";

import { useActionState, useTransition } from "react";
import { createCategory, deleteCategory, type CategoryActionState } from "@/lib/admin/categories-actions";

type Category = { id: string; name: string; slug: string };
type Kind = "work_category" | "work_industry" | "article_category";

export function CategoryManager({ kind, title, items }: { kind: Kind; title: string; items: Category[] }) {
  const [state, formAction, pending] = useActionState<CategoryActionState, FormData>(createCategory, undefined);
  const [deleting, startDelete] = useTransition();

  return (
    <div className="flex flex-col gap-3 border border-line p-5">
      <h2 className="font-mono text-[11px] tracking-[0.08em] text-text-3 uppercase">{title}</h2>

      <ul className="flex flex-col gap-1">
        {items.map((c) => (
          <li key={c.id} className="flex items-center justify-between border-b border-line py-2 text-[13px]">
            <span className="text-text">
              {c.name} <span className="font-mono text-[11px] text-text-3">/{c.slug}</span>
            </span>
            <button
              type="button"
              disabled={deleting}
              onClick={() => {
                if (!confirm(`「${c.name}」を削除しますか？`)) return;
                startDelete(() => deleteCategory(c.id));
              }}
              className="text-[12px] text-[#b3432b] hover:underline disabled:opacity-50"
            >
              削除
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="py-2 text-[13px] text-text-3">未登録</li>}
      </ul>

      <form action={formAction} className="flex gap-2 pt-2">
        <input type="hidden" name="kind" value={kind} />
        <input
          name="name"
          required
          placeholder="新しいカテゴリ名"
          className="flex-1 border border-line bg-bg px-3 py-2 text-[13px] outline-none focus:border-green"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-green px-4 py-2 font-mono text-[11px] tracking-[0.06em] text-white uppercase disabled:opacity-50"
        >
          追加
        </button>
      </form>
      {state?.error && <p className="text-[12px] text-[#b3432b]">{state.error}</p>}
    </div>
  );
}
