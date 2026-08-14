"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { TeamMemberCard } from "@/lib/team";
import styles from "./TeamCarousel.module.css";

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

const AUTOPLAY_INTERVAL_MS = 3000;
const FALLBACK_IMAGE = "/images/team/placeholder.svg";

interface TeamCarouselLabels {
  eyebrow: string;
  title: string;
  detailBtn: string;
  contactBtn: string;
  introSectionTitle: string;
  languageSectionTitle: string;
}

const defaultLabels: TeamCarouselLabels = {
  eyebrow: "社員紹介",
  title: "お客様をサポートするメンバーをご紹介します",
  detailBtn: "詳細を見る ›",
  contactBtn: "このメンバーに相談する",
  introSectionTitle: "メンバー紹介",
  languageSectionTitle: "対応言語",
};

export default function TeamCarousel({
  members,
  contactHref = "/contact",
  labels = defaultLabels,
}: {
  members: TeamMemberCard[];
  /** Base /contact path for this locale; the member's id is appended as
   * `?member=` so a completed submission can be attributed to them. */
  contactHref?: string;
  labels?: TeamCarouselLabels;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalMember, setModalMember] = useState<TeamMemberCard | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const total = members.length;

  const visible = useMemo(() => {
    if (total === 0) return null;
    const prev = members[mod(activeIndex - 1, total)];
    const active = members[activeIndex];
    const next = members[mod(activeIndex + 1, total)];
    return { prev, active, next };
  }, [activeIndex, total, members]);

  const goPrev = () => setActiveIndex((i) => mod(i - 1, total));
  const goNext = () => setActiveIndex((i) => mod(i + 1, total));

  // Auto-advance the carousel; pauses on hover and while the detail modal is open,
  // and restarts the countdown whenever the slide changes (manually or automatically).
  useEffect(() => {
    if (isPaused || modalMember || total <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((i) => mod(i + 1, total));
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPaused, modalMember, total, activeIndex]);

  if (!visible) return null;

  const memberContactHref = (member: TeamMemberCard) =>
    `${contactHref}?member=${member.id}`;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.teamLabel}>TEAM</span>
          <div className={styles.eyebrow}>{labels.eyebrow}</div>
          <h2 className={styles.title}>{labels.title}</h2>
        </div>

        <div
          className={styles.layout}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className={styles.cards}>
            <button
              type="button"
              className={`${styles.card} ${styles.cardSide}`}
              onClick={goPrev}
              aria-label="前のメンバー"
            >
              <div key={visible.prev.id} className={styles.cardImageWrap}>
                <Image
                  src={visible.prev.image ?? FALLBACK_IMAGE}
                  alt=""
                  fill
                  sizes="140px"
                  className={styles.cardImage}
                />
              </div>
            </button>

            <button
              type="button"
              className={`${styles.card} ${styles.cardActive}`}
              onClick={() => setModalMember(visible.active)}
            >
              <div key={visible.active.id} className={styles.cardImageWrap}>
                <Image
                  src={visible.active.image ?? FALLBACK_IMAGE}
                  alt={`${visible.active.lastName} ${visible.active.firstName}`}
                  fill
                  sizes="(max-width: 600px) 60vw, 240px"
                  className={styles.cardImage}
                  priority
                />
              </div>
            </button>

            <button
              type="button"
              className={`${styles.card} ${styles.cardSide}`}
              onClick={goNext}
              aria-label="次のメンバー"
            >
              <div key={visible.next.id} className={styles.cardImageWrap}>
                <Image
                  src={visible.next.image ?? FALLBACK_IMAGE}
                  alt=""
                  fill
                  sizes="140px"
                  className={styles.cardImage}
                />
              </div>
            </button>
          </div>

          <div className={styles.info}>
            <div key={visible.active.id} className={styles.infoContent}>
              <div className={styles.nameRow}>
                <div className={styles.nameBlock}>
                  <span className={styles.kana}>{visible.active.lastNameKana}</span>
                  <span className={styles.kanji}>{visible.active.lastName}</span>
                </div>
                <div className={styles.nameBlock}>
                  <span className={styles.kana}>{visible.active.firstNameKana}</span>
                  <span className={styles.kanji}>{visible.active.firstName}</span>
                </div>
                <span className={styles.position}>
                  {visible.active.position.replace(/^\/\s*/, "")}
                </span>
              </div>
              <div className={styles.department}>{visible.active.department}</div>
              <p className={styles.description}>{visible.active.description}</p>
              <button
                type="button"
                className={styles.detailBtn}
                onClick={() => setModalMember(visible.active)}
              >
                {labels.detailBtn}
              </button>
            </div>

            <div className={styles.navButtons}>
              <button type="button" onClick={goPrev} aria-label="前のメンバー">
                ‹
              </button>
              <button type="button" onClick={goNext} aria-label="次のメンバー">
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalMember && (
        <div className={styles.modalOverlay} onClick={() => setModalMember(null)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              aria-label="閉じる"
              onClick={() => setModalMember(null)}
            >
              &times;
            </button>
            <div className={styles.modalPhoto}>
              <Image
                src={modalMember.image ?? FALLBACK_IMAGE}
                alt={`${modalMember.lastName} ${modalMember.firstName}`}
                fill
                sizes="220px"
                className={styles.modalPhotoImage}
              />
            </div>
            <div className={styles.modalBody}>
              <div className={styles.nameRow}>
                <div className={styles.nameBlock}>
                  <span className={styles.kana}>{modalMember.lastNameKana}</span>
                  <span className={styles.kanji}>{modalMember.lastName}</span>
                </div>
                <div className={styles.nameBlock}>
                  <span className={styles.kana}>{modalMember.firstNameKana}</span>
                  <span className={styles.kanji}>{modalMember.firstName}</span>
                </div>
              </div>
              <div className={styles.department}>{modalMember.department}</div>
              <div className={styles.position}>
                {modalMember.position.replace(/^\/\s*/, "")}
              </div>
              <div className={styles.tags}>
                {modalMember.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className={styles.sectionTitle}>{labels.introSectionTitle}</div>
              <p className={styles.modalDescription}>{modalMember.description}</p>
              <div className={styles.sectionTitle}>{labels.languageSectionTitle}</div>
              <p className={styles.modalDescription}>
                {modalMember.languages.join(" / ")}
              </p>
              <a className={styles.contactBtn} href={memberContactHref(modalMember)}>
                <span>✉</span>
                <span>{labels.contactBtn}</span>
                <span>›</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
