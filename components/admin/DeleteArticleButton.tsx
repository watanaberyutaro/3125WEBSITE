"use client";

import { useTransition } from "react";
import { deleteArticle } from "@/lib/admin/articles-actions";

export function DeleteArticleButton({ id, label }: { id: string; label: string }) {
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm(`「${label}」を削除しますか？この操作は取り消せません。`)) return;
    startTransition(() => deleteArticle(id));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-[#b3432b] hover:underline disabled:opacity-50"
    >
      {pending ? "削除中…" : "削除"}
    </button>
  );
}
