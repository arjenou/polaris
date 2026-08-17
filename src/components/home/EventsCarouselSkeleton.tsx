import Skeleton from "@/components/ui/Skeleton";
import styles from "./EventsCarousel.module.css";

/** Suspense fallback for <EventsSection>, matching EventsCarousel's layout. */
export default function EventsCarouselSkeleton() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <Skeleton width={160} height={22} style={{ marginBottom: 10 }} />
          <Skeleton width="50%" height={13} />
        </div>

        <div className={styles.carouselWrap}>
          <div className={styles.track}>
            <div className={styles.trackInner}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.card} style={{ flexBasis: "25%" }}>
                  <div className={styles.photo}>
                    <Skeleton width="100%" height="100%" radius={0} style={{ position: "absolute", inset: 0 }} />
                  </div>
                  <Skeleton width="80%" height={14} style={{ marginTop: 10 }} />
                  <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
