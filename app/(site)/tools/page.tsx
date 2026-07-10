import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { RevealGrid } from "@/components/motion/RevealGrid";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { buildMetadata } from "@/lib/seo/metadata";
import { TOOLS } from "@/lib/tools/registry";

const TITLE = "無料AIツール";
const DESCRIPTION =
  "3125株式会社が提供する無料のAIツール — 料金シミュレーター・SEOタイトル生成・メタディスクリプション生成・FAQ生成・CTA生成など、Web制作・マーケティングにすぐ使えるツール集です。";

export const metadata: Metadata = buildMetadata({ title: TITLE, description: DESCRIPTION, path: "/tools" });

export default function ToolsPage() {
  return (
    <>
      <Breadcrumb items={[{ name: "Home", path: "/" }, { name: "Tools", path: "/tools" }]} />
      <PageHero
        eyebrowNum="Tools"
        label="Free AI Tools"
        title="使える、無料のAIツール。"
        description="料金の目安算出からSEO文言の下書きまで、Web制作・マーケティングの現場ですぐ使えるツールを無料で公開しています。"
      />

      <section className="section section--dark" aria-label="AIツール一覧">
        <RevealGrid className="tools-grid">
          {TOOLS.map((tool) => (
            <Link className="tool-card" href={`/tools/${tool.slug}`} key={tool.slug} aria-label={tool.name}>
              <span className="tool-card__num" aria-hidden="true">
                {tool.eyebrowNum}
              </span>
              <h3 className="tool-card__name">{tool.name}</h3>
              <p className="tool-card__desc">{tool.shortDescription}</p>
              <div className="tool-card__foot">
                <span className="tool-card__label">無料</span>
                <span className="tool-card__arrow">→</span>
              </div>
            </Link>
          ))}
        </RevealGrid>
      </section>
    </>
  );
}
