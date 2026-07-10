import { notFound } from "next/navigation";
import { getAdminArticleById, getAllCategories } from "@/lib/admin/queries";
import { updateArticle } from "@/lib/admin/articles-actions";
import { ArticleForm } from "@/components/admin/ArticleForm";

function faqToText(faq: unknown): string {
  if (!Array.isArray(faq)) return "";
  return faq
    .map((f) => {
      const item = f as { question?: string; answer?: string };
      return `Q: ${item.question ?? ""}\nA: ${item.answer ?? ""}`;
    })
    .join("\n\n");
}

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, categories] = await Promise.all([getAdminArticleById(id), getAllCategories()]);
  if (!article) notFound();

  const articleCategories = categories.filter((c) => c.kind === "article_category");

  const tagNames = (article.article_tags ?? [])
    .map((row: { tags: { name: string } | { name: string }[] | null }) => {
      const t = Array.isArray(row.tags) ? row.tags[0] : row.tags;
      return t?.name;
    })
    .filter((n: string | undefined): n is string => Boolean(n));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">記事を編集</h1>
        <p className="mt-1 font-mono text-[11px] text-text-3">ID: {id}</p>
      </div>
      <ArticleForm
        action={updateArticle}
        categories={articleCategories}
        defaults={{
          id: article.id,
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt,
          body_markdown: article.body_markdown,
          category_id: article.category_id ?? "",
          cover_image_path: article.cover_image_path,
          og_image_path: article.og_image_path,
          source_link: article.source_link,
          tags: tagNames.join(", "),
          faq: faqToText(article.faq),
          status: article.status,
          seo_title: article.seo_title,
          seo_description: article.seo_description,
          reading_minutes: article.reading_minutes,
        }}
        submitLabel="保存する"
      />
    </div>
  );
}
