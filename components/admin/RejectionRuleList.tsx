import { formatDateTime } from "@/lib/admin/format";
import { toggleRejectionRuleActive, deleteRejectionRule } from "@/lib/admin/rejection-rules-actions";

type RejectionRule = {
  id: string;
  content_type: string;
  rule_text: string;
  active: boolean;
  created_at: string;
};

const CONTENT_TYPE_LABEL: Record<string, string> = {
  article: "記事",
  service_page: "サービスページ",
};

/**
 * content_type別にグループ表示する（/admin/categoriesのkind別グループ表示と同じパターン）。
 * ここで有効(active)なルールだけがprocess-generate/route.tsの生成プロンプトに注入される。
 */
export function RejectionRuleList({ rules }: { rules: RejectionRule[] }) {
  const grouped: Record<string, RejectionRule[]> = { article: [], service_page: [] };
  for (const r of rules) {
    if (grouped[r.content_type]) grouped[r.content_type].push(r);
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {(["article", "service_page"] as const).map((contentType) => (
        <div key={contentType} className="flex flex-col gap-3 border border-line p-5">
          <h2 className="font-mono text-[11px] tracking-[0.08em] text-text-3 uppercase">
            {CONTENT_TYPE_LABEL[contentType]}
          </h2>
          <ul className="flex flex-col gap-2">
            {grouped[contentType].map((rule) => (
              <li key={rule.id} className="flex flex-col gap-2 border-b border-line py-2">
                <p className={`text-[13px] ${rule.active ? "text-text" : "text-text-3 line-through"}`}>
                  {rule.rule_text}
                </p>
                <div className="flex items-center gap-3 font-mono text-[10px] text-text-3">
                  <span>{formatDateTime(rule.created_at)}</span>
                  <form action={toggleRejectionRuleActive}>
                    <input type="hidden" name="id" value={rule.id} />
                    <input type="hidden" name="active" value={rule.active ? "false" : "true"} />
                    <button type="submit" className="uppercase hover:text-green hover:underline">
                      {rule.active ? "無効にする" : "有効にする"}
                    </button>
                  </form>
                  <form action={deleteRejectionRule}>
                    <input type="hidden" name="id" value={rule.id} />
                    <button type="submit" className="uppercase text-[#b3432b] hover:underline">
                      削除
                    </button>
                  </form>
                </div>
              </li>
            ))}
            {grouped[contentType].length === 0 && <li className="py-2 text-[13px] text-text-3">未登録</li>}
          </ul>
        </div>
      ))}
    </div>
  );
}
