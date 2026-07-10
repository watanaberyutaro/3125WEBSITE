import { notFound } from "next/navigation";
import { getAdminWorkById, getAllCategories } from "@/lib/admin/queries";
import { updateWork } from "@/lib/admin/works-actions";
import { WorkForm } from "@/components/admin/WorkForm";

export default async function EditWorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [work, categories] = await Promise.all([getAdminWorkById(id), getAllCategories()]);
  if (!work) notFound();

  const workCategories = categories.filter((c) => c.kind === "work_category");
  const workIndustries = categories.filter((c) => c.kind === "work_industry");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">制作実績を編集</h1>
        <p className="mt-1 font-mono text-[11px] text-text-3">ID: {id}</p>
      </div>
      <WorkForm
        action={updateWork}
        categories={workCategories}
        industries={workIndustries}
        defaults={{
          id: work.id,
          slug: work.slug,
          client_name: work.client_name,
          project_name: work.project_name,
          category_id: work.category_id ?? "",
          industry_id: work.industry_id,
          year: work.year,
          excerpt: work.excerpt,
          description: work.description,
          external_link: work.external_link,
          cover_image_path: work.cover_image_path,
          tags: work.tags ?? [],
          scope: work.scope,
          category_label: work.category_label,
          status: work.status,
          seo_title: work.seo_title,
          seo_description: work.seo_description,
          og_image_path: work.og_image_path,
          sort_order: work.sort_order,
        }}
        submitLabel="保存する"
      />
    </div>
  );
}
