import Skeleton from "@/components/ui/Skeleton";
import styles from "./EventsListPage.module.css";

/** loading.tsx content for /events (and zh variant), matching EventsListPage's layout. */
export default function EventsListPageSkeleton() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <Skeleton width="30%" height={32} style={{ marginBottom: 32 }} />
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.imageWrap}>
                <Skeleton width="100%" height="100%" radius={0} style={{ position: "absolute", inset: 0 }} />
              </div>
              <div className={styles.cardBody}>
                <Skeleton width={90} height={13} />
                <Skeleton width="85%" height={16} style={{ marginTop: 10 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
