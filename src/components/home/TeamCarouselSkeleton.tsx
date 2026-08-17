import Skeleton from "@/components/ui/Skeleton";
import styles from "./TeamCarousel.module.css";

/** Suspense fallback for <TeamSection>, matching TeamCarousel's layout. */
export default function TeamCarouselSkeleton() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <Skeleton width={80} height={13} style={{ marginBottom: 8 }} />
          <Skeleton width="45%" height={24} />
        </div>

        <div className={styles.layout}>
          <div className={styles.cards}>
            <Skeleton width={140} height={180} radius={4} />
            <Skeleton width={220} height={260} radius={4} />
            <Skeleton width={140} height={180} radius={4} />
          </div>

          <div className={styles.info}>
            <Skeleton width="50%" height={20} style={{ marginBottom: 12 }} />
            <Skeleton width="30%" height={14} style={{ marginBottom: 20 }} />
            <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="70%" height={14} />
          </div>
        </div>
      </div>
    </section>
  );
}
