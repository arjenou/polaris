import Skeleton from "@/components/ui/Skeleton";
import styles from "./EventDetailPage.module.css";

/** loading.tsx content for /events/[slug] (and zh variant), matching EventDetailPage's layout. */
export default function EventDetailPageSkeleton() {
  return (
    <article className={styles.section}>
      <div className={styles.inner}>
        <Skeleton width="55%" height={30} style={{ marginBottom: 16 }} />

        <div className={styles.meta}>
          <Skeleton width={130} height={14} />
          <Skeleton width={64} height={20} radius={999} />
        </div>

        <div className={styles.mainRow}>
          <div className={styles.heroWrap}>
            <Skeleton width="100%" height="100%" radius={0} style={{ position: "absolute", inset: 0 }} />
          </div>
          <div className={styles.overviewBox}>
            <Skeleton width="40%" height={20} style={{ marginBottom: 20 }} />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} width="100%" height={14} style={{ marginBottom: 16 }} />
            ))}
          </div>
        </div>

        <Skeleton width="30%" height={22} style={{ marginBottom: 20 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={140} radius={6} />
          ))}
        </div>
      </div>
    </article>
  );
}
