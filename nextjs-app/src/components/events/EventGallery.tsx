"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./EventGallery.module.css";

export default function EventGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const close = () => setOpenIndex(null);
  const showPrev = () =>
    setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  const showNext = () =>
    setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));

  return (
    <>
      <div className={styles.grid}>
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            className={styles.thumb}
            onClick={() => setOpenIndex(index)}
            aria-label={`${alt} ${index + 1}`}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className={styles.thumbImage}
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <button type="button" className={styles.close} aria-label="閉じる" onClick={close}>
            ×
          </button>
          <button
            type="button"
            className={`${styles.navBtn} ${styles.navPrev}`}
            aria-label="前の写真"
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
          >
            ‹
          </button>
          <div className={styles.lightboxImageWrap} onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[openIndex]}
              alt=""
              fill
              sizes="90vw"
              className={styles.lightboxImage}
            />
          </div>
          <button
            type="button"
            className={`${styles.navBtn} ${styles.navNext}`}
            aria-label="次の写真"
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
