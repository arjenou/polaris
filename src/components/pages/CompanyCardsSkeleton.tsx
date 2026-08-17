import Skeleton from "@/components/ui/Skeleton";
import styles from "./CompanyCards.module.css";

function CompanyRowSkeleton() {
  return (
    <div className={styles.company}>
      <div className={styles.companyHeader}>
        <Skeleton width="30%" height={16} />
      </div>
      <div className={styles.companyBody}>
        <div className={styles.logoBox}>
          <Skeleton width="100%" height="100%" radius={0} style={{ position: "absolute", inset: 0 }} />
        </div>
        <div className={styles.divider} />
        <div className={styles.infoList}>
          <div className={styles.infoRow}>
            <Skeleton width={90} height={14} />
            <Skeleton width="60%" height={14} />
          </div>
          <div className={styles.infoRow}>
            <Skeleton width={90} height={14} />
            <Skeleton width="40%" height={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Suspense fallback for <CompanyCards> while group companies load from the CMS. */
export default function CompanyCardsSkeleton({
  companiesTitle,
  domesticTitle,
  overseasTitle,
}: {
  companiesTitle?: string;
  domesticTitle?: string;
  overseasTitle?: string;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {companiesTitle && <h2 className={styles.mainTitle}>{companiesTitle}</h2>}
        {domesticTitle ? (
          <h3 className={styles.subTitle}>{domesticTitle}</h3>
        ) : (
          <Skeleton width={140} height={18} style={{ marginBottom: 16 }} />
        )}
        <div className={styles.list}>
          <CompanyRowSkeleton />
          <CompanyRowSkeleton />
        </div>
        {overseasTitle ? (
          <h3 className={styles.subTitle}>{overseasTitle}</h3>
        ) : (
          <Skeleton width={140} height={18} style={{ marginBottom: 16 }} />
        )}
        <div className={styles.list}>
          <CompanyRowSkeleton />
        </div>
      </div>
    </section>
  );
}
