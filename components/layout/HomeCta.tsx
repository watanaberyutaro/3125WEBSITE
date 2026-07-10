import { Reveal } from "@/components/motion/Reveal";
import { CtaButton } from "@/components/ui/CtaButton";

type Bg = "dark" | "dark2" | "dark3";

/** ページ末尾の共通CTAセクション（旧 .home-cta）。 */
export function HomeCta({
  bg = "dark",
  eyebrow,
  title,
  sub,
  primary,
  secondary,
}: {
  bg?: Bg;
  eyebrow: string;
  title: string;
  sub: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className={`home-cta section--${bg}`} aria-labelledby="cta-heading">
      <div className="home-cta__glow" aria-hidden="true" />
      <Reveal as="p" className="label mb-sm">
        {eyebrow}
      </Reveal>
      <Reveal as="h2" delay={1} className="home-cta__title" id="cta-heading">
        {title}
      </Reveal>
      <Reveal as="p" delay={2} className="home-cta__sub">
        {sub}
      </Reveal>
      <Reveal as="div" delay={3} className="home-cta__actions">
        <CtaButton href={primary.href} variant="gold" magnetic>
          {primary.label}
        </CtaButton>
        {secondary && (
          <CtaButton href={secondary.href} variant="outline" magnetic>
            {secondary.label}
          </CtaButton>
        )}
      </Reveal>
    </section>
  );
}
