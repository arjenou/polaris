"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { heroHeadline as defaultHeadline, heroSlides } from "@/data/home";
import styles from "./Hero.module.css";

export default function Hero({ headline = defaultHeadline }: { headline?: string }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [active]);

  const goToSlide = (index: number) => setActive(index);

  return (
    <section className={styles.hero}>
      {heroSlides.map((slide, index) => (
        <div
          key={slide.image}
          className={`${styles.slide} ${index === active ? styles.slideActive : ""}`}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className={styles.slideImage}
          />
        </div>
      ))}
      <div className={styles.overlay} />
      <h1 className={styles.headline}>{headline}</h1>
      <div className={styles.dots}>
        {heroSlides.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            aria-label={`スライド${index + 1}へ`}
            className={`${styles.dot} ${index === active ? styles.dotActive : ""}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
      <div className={styles.thumbnails}>
        {heroSlides.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            aria-label={`スライド${index + 1}へ切り替え`}
            aria-current={index === active}
            className={`${styles.thumbnail} ${
              index === active ? styles.thumbnailActive : ""
            }`}
            onClick={() => goToSlide(index)}
          >
            <Image src={slide.image} alt="" fill sizes="160px" className={styles.thumbnailImage} />
          </button>
        ))}
      </div>
    </section>
  );
}
