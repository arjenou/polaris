import Link from "next/link";
import { newsItems as defaultNewsItems, type NewsItem } from "@/data/home";
import styles from "./NewsSection.module.css";

export default function NewsSection({
  items = defaultNewsItems,
  moreHref = "/news",
  moreLabel = "一覧を見る",
}: {
  items?: NewsItem[];
  moreHref?: string;
  moreLabel?: string;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.label}>News</div>
        <div className={styles.listWrap}>
          <div className={styles.list}>
            {items.map((item) => (
              <Link key={item.href} href={item.href} className={styles.item}>
                <div className={styles.itemHeader}>
                  <span className={styles.date}>{item.date}</span>
                  <span className={styles.tag}>{item.tag}</span>
                </div>
                <div className={styles.title}>{item.title}</div>
              </Link>
            ))}
          </div>
          <Link href={moreHref} className={styles.more}>
            {moreLabel} ›
          </Link>
        </div>
      </div>
    </section>
  );
}
