"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./PhotoCoverflow.module.css";

export interface CoverflowImage {
  src: string;
  alt?: string;
}

export default function PhotoCoverflow({
  title,
  images,
}: {
  title: string;
  images: CoverflowImage[];
}) {
  const count = images.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % count);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused, count]);

  if (count === 0) return null;

  const prevIndex = (active - 1 + count) % count;
  const nextIndex = (active + 1) % count;

  const goPrev = () => setActive((prev) => (prev - 1 + count) % count);
  const goNext = () => setActive((prev) => (prev + 1) % count);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>{title}</h2>
        <div
          className={styles.stage}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {count > 1 && (
            <button
              type="button"
              aria-label="前の写真"
              className={`${styles.sideImage} ${styles.sideLeft}`}
              onClick={goPrev}
            >
              <Image
                src={images[prevIndex].src}
                alt=""
                fill
                sizes="(max-width: 768px) 0px, 40vw"
                className={styles.sideImagePic}
              />
            </button>
          )}
          <div className={styles.centerImage}>
            <Image
              src={images[active].src}
              alt={images[active].alt ?? ""}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className={styles.centerImagePic}
              priority={active === 0}
            />
          </div>
          {count > 1 && (
            <button
              type="button"
              aria-label="次の写真"
              className={`${styles.sideImage} ${styles.sideRight}`}
              onClick={goNext}
            >
              <Image
                src={images[nextIndex].src}
                alt=""
                fill
                sizes="(max-width: 768px) 0px, 40vw"
                className={styles.sideImagePic}
              />
            </button>
          )}
        </div>
        {count > 1 && (
          <div className={styles.controls}>
            {images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                aria-label={`写真${index + 1}へ切り替え`}
                aria-current={index === active}
                className={`${styles.controlBtn} ${
                  index === active ? styles.controlBtnActive : ""
                }`}
                onClick={() => setActive(index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
