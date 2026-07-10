import { getAllCategories } from "@/lib/admin/queries";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-text">カテゴリ</h1>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CategoryManager
          kind="work_category"
          title="実績カテゴリ"
          items={categories.filter((c) => c.kind === "work_category")}
        />
        <CategoryManager
          kind="work_industry"
          title="実績業種"
          items={categories.filter((c) => c.kind === "work_industry")}
        />
        <CategoryManager
          kind="article_category"
          title="記事カテゴリ"
          items={categories.filter((c) => c.kind === "article_category")}
        />
      </div>
    </div>
  );
}
