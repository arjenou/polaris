import Image from "next/image";
import Link from "next/link";
import {
  recommendedItems as defaultItems,
  type RecommendedItem,
} from "@/data/home";
import styles from "./RecommendedSection.module.css";

export default function RecommendedSection({
  eyebrow = "おすすめ情報",
  title = "最新事例やお役立ち情報をピックアップ！",
  items = defaultItems,
}: {
  eyebrow?: string;
  title?: string;
  items?: RecommendedItem[];
}) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.heading}>
          <div className={styles.eyebrow}>{eyebrow}</div>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <div className={styles.grid}>
          {items.map((item) => (
            <Link key={item.href} href={item.href} className={styles.card}>
              <div className={styles.imageWrap}>
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={styles.image}
                />
              </div>
              <div className={styles.cardBody}>
                <span className={styles.tag}>{item.tag}</span>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.excerpt}>{item.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
