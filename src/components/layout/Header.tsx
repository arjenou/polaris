"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { jaNavItems, zhNavItems, type NavItem } from "@/data/nav";
import { site } from "@/data/site";
import styles from "./Header.module.css";

const comingSoonShort = { ja: "現在、サイトを準備中です", zh: "网站正在准备中" } as const;
const comingSoonDetail = { ja: "公開までしばらくお待ちください。", zh: "请稍候正式公开。" } as const;

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 12L12 4M12 4H5.5M12 4V10.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PaperPlaneIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M18 2L2 9.5l6 2.5m10-10l-4 14-6-3.5m10-10.5L8 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M2.5 10h15M10 2.5c2.1 2.1 3.2 4.8 3.2 7.5s-1.1 5.4-3.2 7.5c-2.1-2.1-3.2-4.8-3.2-7.5s1.1-5.4 3.2-7.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

// ja and zh routes mirror each other 1:1 under the /zh prefix, so the
// equivalent page in the other locale is found by toggling that prefix.
function getLocalePath(pathname: string, targetLocale: "ja" | "zh"): string {
  const isZh = pathname === "/zh" || pathname.startsWith("/zh/");

  if (targetLocale === "zh") {
    if (isZh) return pathname;
    return pathname === "/" ? "/zh" : `/zh${pathname}`;
  }

  if (!isZh) return pathname;
  const stripped = pathname.slice(3);
  return stripped === "" ? "/" : stripped;
}

export default function Header({ locale = "ja" }: { locale?: "ja" | "zh" }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMobileGroups, setOpenMobileGroups] = useState<Set<string>>(new Set());
  const navItems: NavItem[] = locale === "zh" ? zhNavItems : jaNavItems;
  const visibleItems = navItems.filter((item) => !item.hidden);
  const homeHref = locale === "zh" ? "/zh" : "/";
  const contactHref = locale === "zh" ? "/zh/contact" : site.contactHref;
  const comingSoonShortText = comingSoonShort[locale];
  const comingSoonDetailText = comingSoonDetail[locale];
  const logoSubtitle = locale === "ja" ? site.name : null;
  const jaHref = getLocalePath(pathname, "ja");
  const zhHref = getLocalePath(pathname, "zh");

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const toggleMobileGroup = (href: string) => {
    setOpenMobileGroups((prev) => {
      const next = new Set(prev);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
  };

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.languageSwitch}>
            <span className={styles.languageLabel} aria-label="Language" role="img">
              <GlobeIcon className={styles.languageIcon} />
            </span>
            <Link href={jaHref} className={locale === "ja" ? styles.active : undefined}>
              日本語
            </Link>
            <Link href={zhHref} className={locale === "zh" ? styles.active : undefined}>
              中国語
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.mainBar}>
        <div className={styles.inner}>
          <Link href={homeHref} className={styles.logoLink} aria-label={site.nameEn}>
            <span className={styles.logoIconWrap}>
              <Image
                src={site.logoIcon}
                alt=""
                fill
                sizes="48px"
                className={styles.logoIconImage}
                priority
              />
            </span>
            <span className={styles.logoTextGroup}>
              <span className={styles.logoTitle}>{site.nameEn}</span>
              {logoSubtitle && <span className={styles.logoSubtitle}>{logoSubtitle}</span>}
            </span>
          </Link>

          <nav className={styles.desktopNav} aria-label="メインナビゲーション">
            <ul>
              {visibleItems.map((item) => (
                <li key={item.href} className={styles.navItem}>
                  <Link
                    href={item.href}
                    className={pathname === item.href ? styles.active : undefined}
                  >
                    {item.label}
                  </Link>

                  {item.groups && item.groups.length > 0 && (
                    <div className={styles.megaMenu}>
                      <div className={styles.megaHeadingBand}>
                        <Link href={item.href} className={styles.megaHeadingRow}>
                          <span className={styles.megaHeadingText}>{item.label}</span>
                          <ArrowIcon className={styles.megaHeadingArrow} />
                        </Link>
                        {item.comingSoon && (
                          <div className={styles.megaComingSoon}>
                            <span>{comingSoonShortText}</span>
                            <span>{comingSoonDetailText}</span>
                          </div>
                        )}
                      </div>
                      <div className={styles.megaMenuInner}>
                        {item.banner && (
                          <Link href={item.href} className={styles.megaBannerImageWrap}>
                            <Image
                              src={item.banner}
                              alt=""
                              fill
                              sizes="210px"
                              className={styles.megaBannerImage}
                            />
                          </Link>
                        )}
                        {item.brand && (
                          <Link href={item.href} className={styles.megaBrandCard}>
                            <Image
                              src={item.brand}
                              alt=""
                              width={160}
                              height={68}
                              className={styles.megaBrandImage}
                            />
                          </Link>
                        )}
                        {item.groups.map((group) => (
                          <div key={group.heading} className={styles.megaGroup}>
                            <div className={styles.megaGroupHeading}>
                              <span>{group.heading}</span>
                              {group.icon && (
                                <Image
                                  src={group.icon}
                                  alt=""
                                  width={22}
                                  height={22}
                                  className={styles.megaGroupIcon}
                                />
                              )}
                            </div>
                            {group.items.length > 0 && (
                              <ul>
                                {group.items.map((sub) => (
                                  <li key={sub.label}>
                                    <Link
                                      href={sub.href ?? item.href}
                                      className={sub.bold ? styles.megaSubItemBold : undefined}
                                    >
                                      {sub.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <Link href={contactHref} className={styles.contactButton}>
              <PaperPlaneIcon />
              {locale === "zh" ? "联系我们" : "お問い合わせ"}
            </Link>
            <button
              type="button"
              className={styles.menuToggle}
              aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ""}`}
      >
        <nav aria-label="モバイルナビゲーション">
          <ul>
            {visibleItems.map((item) => {
              const hasGroups = item.groups && item.groups.length > 0;
              const isOpen = openMobileGroups.has(item.href);
              return (
                <li key={item.href} className={styles.mobileNavItem}>
                  <div className={styles.mobileNavRow}>
                    <Link
                      href={item.href}
                      className={pathname === item.href ? styles.active : undefined}
                    >
                      {item.label}
                    </Link>
                    {hasGroups && (
                      <button
                        type="button"
                        className={`${styles.mobileGroupToggle} ${
                          isOpen ? styles.mobileGroupToggleOpen : ""
                        }`}
                        aria-label={`${item.label} の詳細を${isOpen ? "閉じる" : "開く"}`}
                        aria-expanded={isOpen}
                        onClick={() => toggleMobileGroup(item.href)}
                      >
                        <span />
                      </button>
                    )}
                  </div>

                  {hasGroups && (
                    <div
                      className={`${styles.mobileGroups} ${
                        isOpen ? styles.mobileGroupsOpen : ""
                      }`}
                    >
                      {item.comingSoon && (
                        <div className={styles.mobileComingSoon}>
                          <span>{comingSoonShortText}</span>
                          <span>{comingSoonDetailText}</span>
                        </div>
                      )}
                      {item.brand && (
                        <Link href={item.href} className={styles.mobileBrandCard}>
                          <Image
                            src={item.brand}
                            alt=""
                            width={140}
                            height={60}
                            className={styles.mobileBrandImage}
                          />
                        </Link>
                      )}
                      {item.groups!.map((group) => (
                        <div key={group.heading} className={styles.mobileGroup}>
                          <div className={styles.mobileGroupHeading}>
                            <span>{group.heading}</span>
                            {group.icon && (
                              <Image
                                src={group.icon}
                                alt=""
                                width={20}
                                height={20}
                                className={styles.mobileGroupIcon}
                              />
                            )}
                          </div>
                          {group.items.filter((sub) => !sub.mobileTrailing).length > 0 && (
                            <ul>
                              {group.items
                                .filter((sub) => !sub.mobileTrailing)
                                .map((sub) => (
                                  <li key={sub.label}>
                                    <Link
                                      href={sub.href ?? item.href}
                                      className={sub.bold ? styles.mobileSubItemBold : undefined}
                                    >
                                      {sub.label}
                                    </Link>
                                  </li>
                                ))}
                            </ul>
                          )}
                        </div>
                      ))}
                      {item.groups!.some((group) =>
                        group.items.some((sub) => sub.mobileTrailing),
                      ) && (
                        <ul className={styles.mobileTrailingItems}>
                          {item.groups!.flatMap((group) =>
                            group.items.filter((sub) => sub.mobileTrailing),
                          ).map((sub) => (
                            <li key={sub.label}>
                              <Link
                                href={sub.href ?? item.href}
                                className={sub.bold ? styles.mobileSubItemBold : undefined}
                              >
                                {sub.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        <div className={styles.mobileLanguageSwitch}>
          <Link href={jaHref}>日本語</Link>
          <span aria-hidden="true">|</span>
          <Link href={zhHref}>中国語</Link>
        </div>
        <Link href={contactHref} className={styles.mobileContactButton}>
          {locale === "zh" ? "联系我们" : "お問い合わせ"}
        </Link>
      </div>
      {menuOpen && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="メニューを閉じる"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}
