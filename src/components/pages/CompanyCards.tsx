import Image from "next/image";
import Link from "next/link";
import styles from "./CompanyCards.module.css";

export interface CompanyCard {
  name: string;
  business: string;
  address: string;
  image: string;
  href?: string;
  comingSoon?: boolean;
}

function Row({
  item,
  businessLabel,
  addressLabel,
}: {
  item: CompanyCard;
  businessLabel: string;
  addressLabel: string;
}) {
  const body = (
    <>
      <div className={styles.logoBox}>
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="280px"
          className={styles.logoImage}
        />
        {item.comingSoon && <span className={styles.badge}>サイト準備中</span>}
      </div>
      <div className={styles.divider} />
      <div className={styles.infoList}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>{businessLabel}</span>
          <span className={styles.infoValue}>{item.business}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>{addressLabel}</span>
          <span className={styles.infoValue}>{item.address}</span>
        </div>
      </div>
    </>
  );

  return (
    <div className={styles.company}>
      <div className={styles.companyHeader}>{item.name}</div>
      {item.href ? (
        <Link href={item.href} className={styles.companyBody}>
          {body}
        </Link>
      ) : (
        <div className={styles.companyBody}>{body}</div>
      )}
    </div>
  );
}

export default function CompanyCards({
  companiesTitle,
  domesticTitle,
  overseasTitle,
  domestic,
  overseas,
  businessLabel = "業務内容",
  addressLabel = "所在地",
}: {
  companiesTitle?: string;
  domesticTitle: string;
  overseasTitle: string;
  domestic: CompanyCard[];
  overseas: CompanyCard[];
  businessLabel?: string;
  addressLabel?: string;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {companiesTitle && <h2 className={styles.mainTitle}>{companiesTitle}</h2>}
        <h3 className={styles.subTitle}>{domesticTitle}</h3>
        <div className={styles.list}>
          {domestic.map((item) => (
            <Row
              key={item.name}
              item={item}
              businessLabel={businessLabel}
              addressLabel={addressLabel}
            />
          ))}
        </div>
        <h3 className={styles.subTitle}>{overseasTitle}</h3>
        <div className={styles.list}>
          {overseas.map((item) => (
            <Row
              key={item.name}
              item={item}
              businessLabel={businessLabel}
              addressLabel={addressLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
