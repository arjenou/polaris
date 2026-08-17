import Skeleton from "@/components/ui/Skeleton";
import styles from "./NewsSection.module.css";

/** Suspense fallback for <LatestNewsSection>, matching NewsSection's layout. */
export default function NewsSectionSkeleton() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.card}>
          <div className={styles.label}>News</div>
          <div className={styles.body}>
            <div className={styles.list}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className={styles.item}>
                  <Skeleton width={70} height={14} />
                  <Skeleton width={64} height={20} radius={999} />
                  <Skeleton width="100%" height={14} style={{ flex: 1 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
