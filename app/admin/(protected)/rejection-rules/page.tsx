import { getRejectionRules } from "@/lib/admin/queries";
import { RejectionRuleList } from "@/components/admin/RejectionRuleList";

export default async function AdminRejectionRulesPage() {
  const rules = await getRejectionRules();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">改善ルール</h1>
        <p className="mt-1 text-[13px] text-text-3">
          却下・修正依頼コメントから「ルール化する」ボタンで作成したルール。有効なものはAI生成のプロンプトに自動で反映されます。
        </p>
      </div>
      <RejectionRuleList rules={rules} />
    </div>
  );
}
