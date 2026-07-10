import { getAllCategories } from "@/lib/admin/queries";
import { createArticle } from "@/lib/admin/articles-actions";
import { ArticleForm } from "@/components/admin/ArticleForm";

export default async function NewArticlePage() {
  const categories = await getAllCategories();
  const articleCategories = categories.filter((c) => c.kind === "article_category");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-text">記事を追加</h1>
      <ArticleForm action={createArticle} categories={articleCategories} submitLabel="追加する" />
    </div>
  );
}
