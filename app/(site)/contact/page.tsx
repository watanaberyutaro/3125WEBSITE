import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { ContactForm } from "@/components/contact/ContactForm";
import { siteConfig } from "@/lib/site-config";

const TITLE = "お問い合わせ";
const DESCRIPTION =
  "3125株式会社へのお問い合わせ — AIマンツーマン教育・AI導入支援・AI研修・AIコンテンツ制作のご依頼・ご相談はこちらから。まずはお気軽にご連絡ください。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `${TITLE} | ${siteConfig.name}`,
    description: DESCRIPTION,
    url: "/contact",
    images: ["/assets/images/ogp.jpg"],
  },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrowNum="Cntct"
        label="Contact"
        title="話しかけてください。"
        description="プロジェクトのご依頼・お見積もり・ご質問など、どんなことでもお気軽にご相談ください。"
      />

      <section className="section section--dark" aria-labelledby="contact-heading">
        <div className="contact-layout">
          <Reveal as="div" variant="left">
            <h2 className="contact-info__title" id="contact-heading">
              お問い合わせ
            </h2>
            <p className="contact-info__body">
              AIマンツーマン教育・AI導入支援・AI研修・AIコンテンツ制作に関するご依頼・ご相談・お見積もりは、フォームまたは直接ご連絡ください。
            </p>

            <div className="contact-detail">
              <div className="contact-detail__item">
                <div className="contact-detail__icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M15 12.18v1.82a1.33 1.33 0 0 1-1.45 1.33A13.2 13.2 0 0 1 8.24 13a13 13 0 0 1-3.34-3.34 13.2 13.2 0 0 1-2.05-5.79A1.33 1.33 0 0 1 4.18 2.5h1.82A1.33 1.33 0 0 1 7.33 3.5a8.56 8.56 0 0 0 .47 1.87 1.33 1.33 0 0 1-.3 1.41l-.77.77a10.67 10.67 0 0 0 4 4l.77-.77a1.33 1.33 0 0 1 1.41-.3 8.56 8.56 0 0 0 1.87.47 1.33 1.33 0 0 1 1.22 1.23z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="contact-detail__key">Phone</p>
                  <p className="contact-detail__val">
                    <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>
                  </p>
                </div>
              </div>

              <div className="contact-detail__item">
                <div className="contact-detail__icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M3 3h12a1.33 1.33 0 0 1 1.33 1.33v9.34A1.33 1.33 0 0 1 15 15H3a1.33 1.33 0 0 1-1.33-1.33V4.33A1.33 1.33 0 0 1 3 3z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M16.33 4L9 9.67 1.67 4"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="contact-detail__key">Email</p>
                  <p className="contact-detail__val">
                    <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                  </p>
                </div>
              </div>

              <div className="contact-detail__item">
                <div className="contact-detail__icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M15.75 7.5c0 5.25-6.75 9.75-6.75 9.75S2.25 12.75 2.25 7.5a6.75 6.75 0 0 1 13.5 0z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <circle cx="9" cy="7.5" r="2.25" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </div>
                <div>
                  <p className="contact-detail__key">Address</p>
                  <p className="contact-detail__val">
                    〒{siteConfig.address.postalCode}
                    <br />
                    {siteConfig.address.region}
                    {siteConfig.address.locality} {siteConfig.address.blockNumber}
                    <br />
                    {siteConfig.address.building}
                  </p>
                </div>
              </div>

              <div className="contact-detail__item">
                <div className="contact-detail__icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M9 5v4l2.67 2.67" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="contact-detail__key">Hours</p>
                  <p className="contact-detail__val">{siteConfig.businessHours}</p>
                </div>
              </div>
            </div>

            <LinkArrow href="/company">会社概要を見る</LinkArrow>
          </Reveal>

          <Reveal as="div" variant="right">
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
