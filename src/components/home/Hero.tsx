"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { heroHeadline as defaultHeadline, heroSlides as defaultSlides, type HeroSlide } from "@/data/home";
import styles from "./Hero.module.css";

export default function Hero({
  headline = defaultHeadline,
  slides = defaultSlides,
}: {
  headline?: string;
  slides?: HeroSlide[];
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [active, slides.length]);

  const goToSlide = (index: number) => setActive(index);

  return (
    <section className={styles.hero}>
      {slides.map((slide, index) => (
        <div
          key={`${slide.image}-${index}`}
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
        {slides.map((slide, index) => (
          <button
            key={`${slide.image}-${index}`}
            type="button"
            aria-label={`スライド${index + 1}へ`}
            className={`${styles.dot} ${index === active ? styles.dotActive : ""}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
      <div className={styles.thumbnails}>
        {slides.map((slide, index) => (
          <button
            key={`${slide.image}-${index}`}
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
