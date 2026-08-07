import styles from "./CompanyTimeline.module.css";

export interface TimelineEntry {
  date: string;
  event: string;
}

export default function CompanyTimeline({
  title,
  items,
}: {
  title: string;
  items: TimelineEntry[];
}) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.list}>
          {items.map((item) => (
            <div key={item.date + item.event} className={styles.item}>
              <div className={styles.date}>{item.date}</div>
              <div className={styles.event}>{item.event}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
