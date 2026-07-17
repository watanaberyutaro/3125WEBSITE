import { createDraft } from "@/lib/admin/drafts-actions";
import { DraftForm } from "@/components/admin/DraftForm";

export default function NewDraftPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-text">新規下書き</h1>
      <DraftForm action={createDraft} submitLabel="下書きを作成する" isNewDraft />
    </div>
  );
}
