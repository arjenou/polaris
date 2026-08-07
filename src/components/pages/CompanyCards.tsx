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

function Card({ item }: { item: CompanyCard }) {
  const body = (
    <>
      <div className={styles.imageWrap}>
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={styles.image}
        />
        {item.comingSoon && <span className={styles.badge}>準備中</span>}
      </div>
      <div className={styles.body}>
        <div className={styles.name}>{item.name}</div>
        <p className={styles.meta}>
          <span className={styles.metaLabel}>業務内容：</span>
          {item.business}
        </p>
        <p className={styles.meta}>
          <span className={styles.metaLabel}>所在地：</span>
          {item.address}
        </p>
      </div>
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} className={styles.card}>
        {body}
      </Link>
    );
  }
  return <div className={styles.card}>{body}</div>;
}

export default function CompanyCards({
  domesticTitle,
  overseasTitle,
  domestic,
  overseas,
}: {
  domesticTitle: string;
  overseasTitle: string;
  domestic: CompanyCard[];
  overseas: CompanyCard[];
}) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>{domesticTitle}</h2>
        <div className={styles.grid}>
          {domestic.map((item) => (
            <Card key={item.name} item={item} />
          ))}
        </div>
        <h2 className={styles.title}>{overseasTitle}</h2>
        <div className={styles.grid}>
          {overseas.map((item) => (
            <Card key={item.name} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
