import Skeleton from "@/components/ui/Skeleton";
import styles from "./AdvantageList.module.css";

/** Suspense fallback for <AdvantageList> while page advantages load from the CMS. */
export default function AdvantageListSkeleton({ title }: { title?: string }) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {title ? (
          <h2 className={styles.title}>{title}</h2>
        ) : (
          <Skeleton width="30%" height={28} style={{ marginBottom: 24 }} />
        )}
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className={`${styles.row} ${index % 2 === 1 ? styles.rowReverse : ""}`}
          >
            <div className={styles.imageWrap}>
              <Skeleton width="100%" height="100%" radius={0} style={{ position: "absolute", inset: 0 }} />
            </div>
            <div className={styles.textCol}>
              <Skeleton width={80} height={20} radius={999} style={{ marginBottom: 12 }} />
              <Skeleton width="70%" height={22} style={{ marginBottom: 12 }} />
              <Skeleton width="100%" height={14} style={{ marginBottom: 6 }} />
              <Skeleton width="90%" height={14} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
