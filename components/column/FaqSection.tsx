import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd } from "@/lib/seo/jsonld";

/**
 * FAQセクション（新規機能）。可視表示とJSON-LDを同時に出力する
 * （GoogleのFAQリッチリザルトは可視コンテンツとの一致を要件としている）。
 */
export function FaqSection({ faq }: { faq: { question: string; answer: string }[] }) {
  if (faq.length === 0) return null;
  const jsonLd = faqJsonLd(faq);

  return (
    <section aria-label="よくある質問" className="mx-auto max-w-[800px] px-[var(--px)] pb-16">
      {jsonLd && <JsonLd data={jsonLd} />}
      <p className="mb-5 font-mono text-[10px] tracking-[0.16em] text-text-3 uppercase">FAQ</p>
      <dl className="flex flex-col gap-5">
        {faq.map((item, i) => (
          <div key={i} className="border-b border-line pb-5">
            <dt className="mb-2 text-[15px] font-medium text-text" style={{ fontFamily: "var(--font-jp)" }}>
              Q. {item.question}
            </dt>
            <dd className="text-[14px] leading-loose text-text-2" style={{ fontFamily: "var(--font-jp)" }}>
              A. {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
