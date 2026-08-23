"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./PageHero.module.css";

export default function PageHero({
  image,
  title,
}: {
  image: string;
  title: string;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [fontSize, setFontSize] = useState<number | undefined>(undefined);

  useEffect(() => {
    const overlay = overlayRef.current;
    const el = titleRef.current;
    if (!overlay || !el) return;

    function fit() {
      if (!overlay || !el) return;
      // Reset to the CSS-defined (responsive) size before measuring, so the
      // shrink factor is always computed from the "ideal" size rather than
      // compounding on top of a previous shrink.
      el.style.fontSize = "";
      const baseSize = parseFloat(getComputedStyle(el).fontSize);
      const available = overlay.clientWidth;
      const natural = el.scrollWidth;
      if (natural > available) {
        setFontSize(Math.max(14, baseSize * (available / natural) * 0.96));
      } else {
        setFontSize(undefined);
      }
    }

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [title]);

  return (
    <section className={styles.hero}>
      <Image src={image} alt="" fill priority sizes="100vw" className={styles.image} />
      <div ref={overlayRef} className={styles.overlay}>
        <h1 ref={titleRef} className={styles.title} style={fontSize ? { fontSize } : undefined}>
          {title}
        </h1>
      </div>
    </section>
  );
}
