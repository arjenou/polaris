import Skeleton from "@/components/ui/Skeleton";
import styles from "./RecommendedSection.module.css";

/** Suspense fallback for <LatestRecommendedSection>, matching RecommendedSection's layout. */
export default function RecommendedSectionSkeleton() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.heading}>
          <Skeleton width={100} height={13} style={{ marginBottom: 8 }} />
          <Skeleton width="55%" height={26} />
        </div>
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.imageWrap}>
                <Skeleton width="100%" height="100%" radius={0} style={{ position: "absolute", inset: 0 }} />
              </div>
              <div className={styles.cardBody}>
                <Skeleton width={60} height={18} radius={3} style={{ marginBottom: 10 }} />
                <Skeleton width="90%" height={16} style={{ marginBottom: 8 }} />
                <Skeleton width="70%" height={13} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
