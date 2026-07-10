import { getAdminInquiries } from "@/lib/admin/queries";
import { InquiryStatusSelect } from "@/components/admin/InquiryStatusSelect";

const INQUIRY_LABELS: Record<string, string> = {
  education: "AIマンツーマン教育",
  implementation: "AI導入支援",
  training: "AI研修・ワークショップ",
  content: "AIコンテンツ制作",
  video: "映像制作",
  web: "Webサイト制作",
  other: "その他",
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default async function AdminInquiriesPage() {
  const inquiries = await getAdminInquiries();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-text">お問い合わせ</h1>

      <div className="flex flex-col gap-3">
        {inquiries.map((inq) => (
          <div key={inq.id} className="border border-line p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[14px] font-medium text-text">
                  {inq.name}
                  {inq.company && <span className="text-text-3"> / {inq.company}</span>}
                </p>
                <p className="mt-1 font-mono text-[11px] text-text-3">
                  {inq.email} {inq.phone && `· ${inq.phone}`}
                </p>
              </div>
              <InquiryStatusSelect id={inq.id} status={inq.status} />
            </div>

            <div className="mt-3 flex flex-wrap gap-3 font-mono text-[11px] text-text-3">
              <span>{INQUIRY_LABELS[inq.inquiry_type] ?? inq.inquiry_type}</span>
              {inq.budget && <span>· 予算: {inq.budget}</span>}
              <span>· {formatDateTime(inq.created_at)}</span>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-text-2">{inq.message}</p>
          </div>
        ))}
        {inquiries.length === 0 && <p className="text-[13px] text-text-3">問い合わせはまだありません。</p>}
      </div>
    </div>
  );
}
