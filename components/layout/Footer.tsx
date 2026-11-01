import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/works", label: "Works" },
  { href: "/column", label: "News" },
  { href: "/company", label: "Company" },
  { href: "/contact", label: "Contact" },
] as const;

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__upper">
        <div className="footer__brand">
          <Link href="/" className="footer__logo">
            3125
          </Link>
          <p className="footer__tagline">{siteConfig.tagline}</p>
        </div>
        <nav className="footer__links" aria-label="フッターナビゲーション">
          {FOOTER_LINKS.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <address className="footer__contact">
          <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
        </address>
      </div>
      <div className="footer__lower">
        <p className="footer__copy">© 2024–2025 {siteConfig.name}. All rights reserved.</p>
        <address className="footer__addr">{siteConfig.address.full}</address>
      </div>
    </footer>
  );
}
