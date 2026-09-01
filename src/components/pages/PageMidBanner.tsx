import Image from "next/image";
import type { PageMidImage } from "@/lib/pageMidImages";
import styles from "./PageMidBanner.module.css";

/** Optional full-width banner between advantages and the photo carousel. */
export default function PageMidBanner({ image }: { image: PageMidImage | null }) {
  if (!image?.src) return null;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.frame}>
          <Image
            src={image.src}
            alt=""
            width={image.width}
            height={image.height}
            sizes="(max-width: 900px) 100vw, var(--container-width)"
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
}
