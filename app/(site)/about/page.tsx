import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { HomeCta } from "@/components/layout/HomeCta";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGrid } from "@/components/motion/RevealGrid";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo/metadata";

const TITLE = "AIコンサルティング会社について";
const DESCRIPTION =
  "3125株式会社について — AIマンツーマン教育・AI導入支援・AI研修を手がけるAIコンサルティング会社。2024年創業。私たちのフィロソフィーとチームについてご紹介します。";

export const metadata: Metadata = buildMetadata({ title: TITLE, description: DESCRIPTION, path: "/about" });

const TEAM = [
  {
    initial: "R",
    role: "CEO / Founder",
    name: siteConfig.representative.name,
    nameEn: siteConfig.representative.nameEn,
    bio: "AIマンツーマン教育・AI導入支援を専門とし、経営者から現場担当者まで幅広い層へのAI活用支援を手がける。3125株式会社の代表取締役として、AIで社会を変えるビジョンを牽引する。",
  },
  {
    initial: "H",
    role: "Director",
    name: siteConfig.directors[0].name,
    nameEn: siteConfig.directors[0].nameEn,
    bio: "AI研修プログラムの設計・運営とAIコンテンツ制作を担当。受講者の習熟度に合わせたカリキュラム開発を得意とし、組織全体のAIリテラシー向上を実現する。",
  },
  {
    initial: "I",
    role: "Director",
    name: siteConfig.directors[1].name,
    nameEn: siteConfig.directors[1].nameEn,
    bio: "AI活用戦略の策定と業務自動化の導入支援を担当。データ分析とプロセス設計を組み合わせ、クライアントの業務効率化と競争力強化を実現する。",
  },
];

export default function AboutPage() {
  return (
    <>
      <Breadcrumb items={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />
      <PageHero
        eyebrowNum="About"
        label="About Us"
        title="AIで、未来をつくる。"
        description="2024年5月設立。AIマンツーマン教育・AI導入支援・AI研修を通じて、ビジネスのAI活用を本質から支援する会社です。"
      />

      <section className="section section--dark" aria-labelledby="concept-heading">
        <SectionHeader
          num="01"
          label="Philosophy"
          title="私たちの哲学"
          body="AIは道具です。使いこなす人間があってはじめて価値が生まれる。私たちは技術の先にある「人の成長」と「ビジネスの変革」にフォーカスし、一社一社に向き合い続けます。"
          id="concept-heading"
        />

        <div className="concept-panels">
          <Reveal as="article" variant="left" className="concept-panel concept-panel--beauty">
            <div className="concept-panel__bg" aria-hidden="true" />
            <div className="concept-panel__deco" aria-hidden="true">
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="0.5" />
                <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.5" />
                <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.5" />
              </svg>
            </div>
            <p className="concept-panel__num">01</p>
            <p className="concept-panel__key">Intelligence</p>
            <h3 className="concept-panel__title">AIの知性で、ビジネスの本質を解く</h3>
            <p className="concept-panel__body">
              AIは膨大なデータから本質的なパターンを見出す力を持っています。3125は、その知性をクライアントのビジネス課題に適切に当てはめ、真の価値を引き出す支援を行います。テクノロジーの先にある「人の成長」を最も大切にします。
            </p>
            <LinkArrow href="/services">Services</LinkArrow>
          </Reveal>

          <Reveal as="article" variant="right" className="concept-panel concept-panel--freedom">
            <div className="concept-panel__bg" aria-hidden="true" />
            <div className="concept-panel__deco" aria-hidden="true">
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
                <rect x="15" y="15" width="75" height="75" rx="8" stroke="currentColor" strokeWidth="0.5" />
                <rect x="55" y="55" width="90" height="90" rx="10" stroke="currentColor" strokeWidth="0.5" />
                <rect x="105" y="15" width="75" height="75" rx="8" stroke="currentColor" strokeWidth="0.5" />
              </svg>
            </div>
            <p className="concept-panel__num">02</p>
            <p className="concept-panel__key">Practice</p>
            <h3 className="concept-panel__title">現場で機能するAIを、一緒につくる</h3>
            <p className="concept-panel__body">
              理論だけのAI導入は意味がありません。実際の業務フローに溶け込み、担当者が自走できるAI活用の仕組みを設計します。マンツーマン教育から組織研修まで、現場の実態に寄り添った支援を積み重ねています。
            </p>
            <LinkArrow href="/works">Works</LinkArrow>
          </Reveal>
        </div>
      </section>

      <section className="philosophy-strip section--dark3">
        <div className="philosophy-strip__inner">
          <Reveal as="div" variant="left">
            <p className="label mb-sm">Our Mission</p>
            <p className="philosophy-strip__quote">
              AIの可能性を、
              <br />
              <em>ビジネス</em>へ。
            </p>
          </Reveal>
          <Reveal as="div" variant="right">
            <p className="philosophy-strip__body">
              AIの導入は、ツールを使えるようにすることではありません。組織の思考と行動様式そのものを変えること——それが私たちの目指す支援です。人とAIが共に機能する組織をつくるパートナーとして伴走します。
            </p>
            <p className="philosophy-strip__body">
              2024年の創業以来、マンツーマン教育・導入支援・研修を通じて、業種・規模を問わず多くの企業のAI活用を実現してきました。
            </p>
            <LinkArrow href="/contact">プロジェクトを相談する</LinkArrow>
          </Reveal>
        </div>
      </section>

      <section className="section section--dark2" aria-labelledby="team-heading">
        <SectionHeader
          num="02"
          label="Team"
          title="チーム"
          body="AI教育・導入支援・コンテンツ制作のプロフェッショナルが、クライアントのAI活用実現のために連携します。"
          id="team-heading"
        />

        <RevealGrid className="team-grid">
          {TEAM.map((member) => (
            <article className="team-card" key={member.name}>
              <div className="team-card__avatar" aria-hidden="true">
                {member.initial}
              </div>
              <p className="team-card__role">{member.role}</p>
              <h3 className="team-card__name">
                {member.name}
                <span className="team-card__name-en">{member.nameEn}</span>
              </h3>
              <p className="team-card__bio">{member.bio}</p>
            </article>
          ))}
        </RevealGrid>
      </section>

      <HomeCta
        bg="dark"
        eyebrow="Let's Work Together"
        title="AIで、ビジネスを変えませんか。"
        sub="プロジェクトのご依頼・お見積もり・ご質問など、何でもお気軽にご相談ください。"
        primary={{ href: "/contact", label: "お問い合わせ" }}
        secondary={{ href: "/works", label: "実績を見る" }}
      />
    </>
  );
}
