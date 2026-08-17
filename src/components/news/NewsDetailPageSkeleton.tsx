import Skeleton from "@/components/ui/Skeleton";
import styles from "./NewsDetailPage.module.css";

/** loading.tsx content for /news/[slug] (and zh variant), matching NewsDetailPage's layout. */
export default function NewsDetailPageSkeleton() {
  return (
    <article className={styles.section}>
      <div className={styles.inner}>
        <Skeleton width={120} height={14} style={{ marginBottom: 24 }} />

        <div className={styles.meta}>
          <Skeleton width={70} height={14} />
          <Skeleton width={56} height={20} radius={999} />
        </div>

        <Skeleton width="70%" height={30} style={{ margin: "16px 0 24px" }} />

        <div className={styles.imageWrap}>
          <Skeleton width="100%" height={360} radius={0} />
        </div>

        <Skeleton width="100%" height={16} style={{ marginBottom: 14 }} />
        <Skeleton width="100%" height={16} style={{ marginBottom: 14 }} />
        <Skeleton width="90%" height={16} style={{ marginBottom: 14 }} />
        <Skeleton width="95%" height={16} style={{ marginBottom: 14 }} />
        <Skeleton width="60%" height={16} />
      </div>
    </article>
  );
}
