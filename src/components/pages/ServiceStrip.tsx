import Image from "next/image";
import styles from "./ServiceStrip.module.css";

export interface ServiceItem {
  title: string;
  image: string;
}

export default function ServiceStrip({ items }: { items: ServiceItem[] }) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.eyebrow}>SERVICES</div>
        <div
          className={styles.grid}
          style={{ "--cols": Math.min(items.length, 5) } as React.CSSProperties}
        >
          {items.map((item) => (
            <div key={item.title} className={styles.card}>
              <div className={styles.imageWrap}>
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 600px) 50vw, 20vw"
                  className={styles.image}
                />
              </div>
              <div className={styles.cardTitle}>{item.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
