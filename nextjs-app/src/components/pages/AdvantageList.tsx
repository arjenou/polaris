import Image from "next/image";
import styles from "./AdvantageList.module.css";

export interface Advantage {
  badge: string;
  heading: string;
  body: string;
  image: string;
}

export default function AdvantageList({
  title,
  items,
}: {
  title: string;
  items: Advantage[];
}) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>{title}</h2>
        {items.map((item, index) => (
          <div
            key={item.heading}
            className={`${styles.row} ${index % 2 === 1 ? styles.rowReverse : ""}`}
          >
            <div className={styles.imageWrap}>
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 44vw"
                className={styles.image}
              />
            </div>
            <div className={styles.textCol}>
              <span className={styles.badge}>{item.badge}</span>
              <h3 className={styles.heading}>{item.heading}</h3>
              <p className={styles.body}>{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
