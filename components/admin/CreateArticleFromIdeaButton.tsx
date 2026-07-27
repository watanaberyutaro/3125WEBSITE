"use client";

import { useFormStatus } from "react-dom";
import { createArticleFromIdea } from "@/lib/admin/topic-ideas-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-green px-4 py-2 font-mono text-[11px] tracking-[0.06em] text-white uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "作成中…" : "記事作成"}
    </button>
  );
}

export function CreateArticleFromIdeaButton({ ideaId }: { ideaId: string }) {
  return (
    <form action={createArticleFromIdea}>
      <input type="hidden" name="ideaId" value={ideaId} />
      <SubmitButton />
    </form>
  );
}
