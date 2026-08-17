import Skeleton from "@/components/ui/Skeleton";
import styles from "./PhotoCoverflow.module.css";

/** Suspense fallback for <PhotoCoverflow> while the page gallery loads from the CMS. */
export default function PhotoCoverflowSkeleton({ title }: { title?: string }) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {title ? (
          <h2 className={styles.title}>{title}</h2>
        ) : (
          <Skeleton width="30%" height={28} style={{ marginBottom: 24 }} />
        )}
        <div className={styles.stage}>
          <div className={styles.centerImage}>
            <Skeleton width="100%" height="100%" radius={0} style={{ position: "absolute", inset: 0 }} />
          </div>
        </div>
      </div>
    </section>
  );
}
