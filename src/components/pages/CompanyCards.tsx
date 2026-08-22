import Image from "next/image";
import Link from "next/link";
import styles from "./CompanyCards.module.css";

export interface CompanyCard {
  id?: number;
  name: string;
  business?: string;
  address?: string;
  phone?: string;
  established?: string;
  capital?: string;
  representative?: string;
  image: string;
  href?: string;
  comingSoon?: boolean;
}

const LABELS: Record<
  "ja" | "zh",
  { address: string; phone: string; established: string; capital: string; representative: string; business: string }
> = {
  ja: {
    address: "所在地",
    phone: "電話番号",
    established: "設立",
    capital: "資本金",
    representative: "代表取締役",
    business: "事業内容",
  },
  zh: {
    address: "所在地",
    phone: "电话号码",
    established: "成立时间",
    capital: "注册资本",
    representative: "法定代表人",
    business: "经营内容",
  },
};

function Row({ item, labels }: { item: CompanyCard; labels: (typeof LABELS)["ja"] }) {
  const fields: { label: string; value: string | undefined }[] = [
    { label: labels.address, value: item.address },
    { label: labels.phone, value: item.phone },
    { label: labels.established, value: item.established },
    { label: labels.capital, value: item.capital },
    { label: labels.representative, value: item.representative },
    { label: labels.business, value: item.business },
  ].filter((field) => field.value && field.value.trim());

  const body = (
    <>
      <div className={styles.logoBox}>
        {item.image && (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="280px"
            className={styles.logoImage}
          />
        )}
        {item.comingSoon && <span className={styles.badge}>サイト準備中</span>}
      </div>
      <div className={styles.divider} />
      <div className={styles.infoList}>
        {fields.map((field) => (
          <div key={field.label} className={styles.infoRow}>
            <span className={styles.infoLabel}>{field.label}</span>
            <span className={styles.infoValue}>{field.value}</span>
          </div>
        ))}
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
  locale = "ja",
  companiesTitle,
  domesticTitle,
  overseasTitle,
  domestic,
  overseas,
}: {
  locale?: "ja" | "zh";
  companiesTitle?: string;
  domesticTitle: string;
  overseasTitle: string;
  domestic: CompanyCard[];
  overseas: CompanyCard[];
}) {
  const labels = LABELS[locale];

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {companiesTitle && <h2 className={styles.mainTitle}>{companiesTitle}</h2>}
        <h3 className={styles.subTitle}>{domesticTitle}</h3>
        <div className={styles.list}>
          {domestic.map((item) => (
            <Row key={item.id ?? item.name} item={item} labels={labels} />
          ))}
        </div>
        <h3 className={styles.subTitle}>{overseasTitle}</h3>
        <div className={styles.list}>
          {overseas.map((item) => (
            <Row key={item.id ?? item.name} item={item} labels={labels} />
          ))}
        </div>
      </div>
    </section>
  );
}
