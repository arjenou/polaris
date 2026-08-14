"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { EventCard } from "@/lib/events";
import styles from "./OtherEventsCarousel.module.css";

function useVisibleCount() {
  const [count, setCount] = useState(4);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w <= 600) setCount(1);
      else if (w <= 900) setCount(2);
      else if (w <= 1100) setCount(3);
      else setCount(4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return count;
}

export default function OtherEventsCarousel({
  events,
  basePath,
}: {
  events: EventCard[];
  basePath: string;
}) {
  const visibleCount = useVisibleCount();
  const [rawStartIndex, setStartIndex] = useState(0);
  const maxStart = Math.max(0, events.length - visibleCount);
  const startIndex = Math.min(rawStartIndex, maxStart);

  const goPrev = () => setStartIndex((i) => Math.max(0, i - 1));
  const goNext = () => setStartIndex((i) => Math.min(maxStart, i + 1));

  if (events.length === 0) return null;

  return (
    <div className={styles.carouselWrap}>
      {startIndex > 0 && (
        <button
          type="button"
          className={`${styles.navBtn} ${styles.navBtnPrev}`}
          onClick={goPrev}
          aria-label="前へ"
        >
          ‹
        </button>
      )}

      <div className={styles.track}>
        <div
          className={styles.trackInner}
          style={{
            transform: `translateX(-${(startIndex * 100) / visibleCount}%)`,
          }}
        >
          {events.map((event) => (
            <div
              key={event.slug}
              className={styles.card}
              style={{ flexBasis: `${100 / visibleCount}%` }}
            >
              <Link href={`${basePath}/${event.slug}`} className={styles.cardLink}>
                <div className={styles.photo}>
                  {event.image && (
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="(max-width: 600px) 100vw, 25vw"
                      className={styles.photoImage}
                    />
                  )}
                  <span
                    className={styles.badge}
                    style={{ backgroundColor: event.badgeColor }}
                  >
                    {event.badge}
                  </span>
                </div>
                <div className={styles.eventTitle}>{event.title}</div>
                <div className={styles.eventDate}>{event.date}</div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {startIndex < maxStart && (
        <button
          type="button"
          className={`${styles.navBtn} ${styles.navBtnNext}`}
          onClick={goNext}
          aria-label="次へ"
        >
          ›
        </button>
      )}
    </div>
  );
}
