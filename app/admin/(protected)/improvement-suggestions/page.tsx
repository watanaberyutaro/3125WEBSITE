import { getPublishedDraftsWithSuggestions } from "@/lib/admin/queries";
import { ImprovementSuggestionList } from "@/components/admin/ImprovementSuggestionList";

export default async function AdminImprovementSuggestionsPage() {
  const items = await getPublishedDraftsWithSuggestions();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">改善提案</h1>
        <p className="mt-1 text-[13px] text-text-3">
          公開済みの記事・サービスページに対して、機械的チェックとAIによる改善提案を生成できます。「修正依頼として送る」を押すと下書きが修正依頼中に戻り、AIによる書き直し・再承認で公開内容を更新できます。
        </p>
      </div>
      <ImprovementSuggestionList items={items} />
    </div>
  );
}
