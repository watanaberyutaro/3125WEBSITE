import { getArticleTopicIdeas } from "@/lib/admin/queries";
import { ArticleIdeaList } from "@/components/admin/ArticleIdeaList";
import { GenerateTopicIdeasButton } from "@/components/admin/GenerateTopicIdeasButton";

export default async function ArticleIdeasPage() {
  const ideas = await getArticleTopicIdeas();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">記事ネタ</h1>
          <p className="mt-1 text-[13px] text-text-3">
            過去に公開・企画済みの記事タイトルと重複しない新しい記事の企画をAIに提案させます。「記事作成」を押すとその企画のままAI記事生成が始まり、下書き詳細画面で進捗を確認できます。
          </p>
        </div>
        <GenerateTopicIdeasButton />
      </div>
      <ArticleIdeaList ideas={ideas} />
    </div>
  );
}
