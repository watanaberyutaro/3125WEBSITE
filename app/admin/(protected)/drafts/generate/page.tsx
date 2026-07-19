import { GenerateDraftForm } from "@/components/admin/GenerateDraftForm";

export default function GenerateDraftPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-text">AIで下書きを生成する</h1>
      <GenerateDraftForm />
    </div>
  );
}
