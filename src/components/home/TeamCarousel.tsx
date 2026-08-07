"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { MEMBER_CONTACT_URL, teamMembers } from "@/data/team";
import styles from "./TeamCarousel.module.css";

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

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
  labels = defaultLabels,
}: {
  labels?: TeamCarouselLabels;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalMember, setModalMember] = useState<(typeof teamMembers)[number] | null>(
    null
  );
  const total = teamMembers.length;

  const visible = useMemo(() => {
    const prev = teamMembers[mod(activeIndex - 1, total)];
    const active = teamMembers[activeIndex];
    const next = teamMembers[mod(activeIndex + 1, total)];
    return { prev, active, next };
  }, [activeIndex, total]);

  const goPrev = () => setActiveIndex((i) => mod(i - 1, total));
  const goNext = () => setActiveIndex((i) => mod(i + 1, total));

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.teamLabel}>TEAM</span>
          <div className={styles.eyebrow}>{labels.eyebrow}</div>
          <h2 className={styles.title}>{labels.title}</h2>
        </div>

        <div className={styles.layout}>
          <div className={styles.cards}>
            <button
              type="button"
              className={`${styles.card} ${styles.cardSide}`}
              onClick={goPrev}
              aria-label="前のメンバー"
            >
              <Image src={visible.prev.image} alt="" fill sizes="140px" className={styles.cardImage} />
            </button>

            <button
              type="button"
              className={`${styles.card} ${styles.cardActive}`}
              onClick={() => setModalMember(visible.active)}
            >
              <Image
                src={visible.active.image}
                alt={`${visible.active.lastName} ${visible.active.firstName}`}
                fill
                sizes="(max-width: 600px) 60vw, 240px"
                className={styles.cardImage}
                priority
              />
            </button>

            <button
              type="button"
              className={`${styles.card} ${styles.cardSide}`}
              onClick={goNext}
              aria-label="次のメンバー"
            >
              <Image src={visible.next.image} alt="" fill sizes="140px" className={styles.cardImage} />
            </button>
          </div>

          <div className={styles.info}>
            <div className={styles.nameRow}>
              <div className={styles.nameBlock}>
                <span className={styles.kana}>{visible.active.lastNameJp}</span>
                <span className={styles.kanji}>{visible.active.lastName}</span>
              </div>
              <div className={styles.nameBlock}>
                <span className={styles.kana}>{visible.active.firstNameJp}</span>
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
                src={modalMember.image}
                alt={`${modalMember.lastName} ${modalMember.firstName}`}
                fill
                sizes="220px"
                className={styles.cardImage}
              />
            </div>
            <div className={styles.modalBody}>
              <div className={styles.nameRow}>
                <div className={styles.nameBlock}>
                  <span className={styles.kana}>{modalMember.lastNameJp}</span>
                  <span className={styles.kanji}>{modalMember.lastName}</span>
                </div>
                <div className={styles.nameBlock}>
                  <span className={styles.kana}>{modalMember.firstNameJp}</span>
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
              <a className={styles.contactBtn} href={MEMBER_CONTACT_URL}>
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
