import Skeleton from "@/components/ui/Skeleton";
import styles from "./NewsListPage.module.css";

/** loading.tsx content for /news, /recommended (and zh variants), matching NewsListPage's layout. */
export default function NewsListPageSkeleton() {
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
                <div className={styles.meta}>
                  <Skeleton width={70} height={13} />
                  <Skeleton width={56} height={18} radius={999} />
                </div>
                <Skeleton width="90%" height={16} style={{ marginTop: 10, marginBottom: 8 }} />
                <Skeleton width="70%" height={13} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
