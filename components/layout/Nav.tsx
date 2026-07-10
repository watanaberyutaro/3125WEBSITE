"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/site-config";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/works", label: "Works" },
  { href: "/column", label: "News" },
  { href: "/tools", label: "Tools" },
  { href: "/company", label: "Company" },
] as const;

/**
 * グローバルナビゲーション + モバイルメニュー（旧 nav / mobile-menu 相当）。
 * スクロール状態のトグル、ハンバーガーからの円形展開メニューを移植する。
 */
export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // トップページはヒーローが濃色背景のため未スクロール時はnavを透過させる。
    // 内側ページは常にscrolled状態（旧サイトの nav.scrolled クラス初期付与に合わせる）。
    const isHome = pathname === "/";
    const update = () => setScrolled(!isHome || window.scrollY > 12);
    update();
    if (!isHome) return;
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const setOrigin = () => {
      const el = hamburgerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      document.documentElement.style.setProperty("--mm-top", `${Math.round(r.top)}px`);
      document.documentElement.style.setProperty(
        "--mm-right",
        `${Math.round(window.innerWidth - r.right)}px`,
      );
      document.documentElement.style.setProperty("--mm-size", `${Math.round(r.width)}px`);
    };
    setOrigin();
    window.addEventListener("resize", setOrigin, { passive: true });
    return () => window.removeEventListener("resize", setOrigin);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, [menuOpen]);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav
        className={`nav${scrolled ? " scrolled" : ""}${menuOpen ? " menu-open" : ""}`}
        id="nav"
        role="navigation"
        aria-label="メインナビゲーション"
      >
        <div className="nav__inner">
          <Link href="/" className="nav__logo" aria-label={`${siteConfig.name} ホームへ`}>
            <span className="nav__logo-num">3125</span>
            <span className="nav__logo-sub">株式会社</span>
          </Link>
          <ul className="nav__links" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={isActive(link.href) ? "active" : ""}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/contact"
                className={`nav__cta${isActive("/contact") ? " active" : ""}`}
              >
                Contact
              </Link>
            </li>
          </ul>
          <button
            ref={hamburgerRef}
            className={`nav__hamburger${menuOpen ? " open" : ""}`}
            id="hamburger"
            aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div
        className={`mobile-menu${menuOpen ? " open" : ""}`}
        id="mobile-menu"
        role="dialog"
        aria-label="モバイルメニュー"
        aria-modal="true"
      >
        <div className="mm__ghost" aria-hidden="true">
          3125
        </div>
        <div className="mm__inner">
          <nav className="mm__nav" aria-label="モバイルナビゲーション">
            {NAV_LINKS.map((link, i) => (
              <div className="mm__item" key={link.href}>
                <div className="mm__item-inner">
                  <span className="mm__num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Link
                    href={link.href}
                    className={`mm__link${isActive(link.href) ? " active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </div>
              </div>
            ))}
            <div className="mm__item">
              <div className="mm__item-inner">
                <span className="mm__num" aria-hidden="true">
                  {String(NAV_LINKS.length + 1).padStart(2, "0")}
                </span>
                <Link
                  href="/contact"
                  className={`mm__link mm__link--cta${isActive("/contact") ? " active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>
            </div>
          </nav>
          <div className="mm__foot" aria-hidden="true">
            <address className="mm__contact">
              <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>
              <span className="mm__sep">·</span>
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            </address>
            <p className="mm__addr">
              〒{siteConfig.address.postalCode} {siteConfig.address.region}
              {siteConfig.address.locality} {siteConfig.address.blockNumber}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
