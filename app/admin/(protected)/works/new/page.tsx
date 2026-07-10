import { getAllCategories } from "@/lib/admin/queries";
import { createWork } from "@/lib/admin/works-actions";
import { WorkForm } from "@/components/admin/WorkForm";

export default async function NewWorkPage() {
  const categories = await getAllCategories();
  const workCategories = categories.filter((c) => c.kind === "work_category");
  const workIndustries = categories.filter((c) => c.kind === "work_industry");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-text">制作実績を追加</h1>
      <WorkForm
        action={createWork}
        categories={workCategories}
        industries={workIndustries}
        submitLabel="追加する"
      />
    </div>
  );
}
