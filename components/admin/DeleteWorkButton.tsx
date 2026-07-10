"use client";

import { useTransition } from "react";
import { deleteWork } from "@/lib/admin/works-actions";

export function DeleteWorkButton({ id, label }: { id: string; label: string }) {
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm(`「${label}」を削除しますか？この操作は取り消せません。`)) return;
    startTransition(() => deleteWork(id));
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
