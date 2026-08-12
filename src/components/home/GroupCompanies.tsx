import Image from "next/image";
import Link from "next/link";
import {
  domesticCompanies as defaultDomestic,
  overseasCompanies as defaultOverseas,
  type GroupCompanyCard,
} from "@/data/home";
import styles from "./GroupCompanies.module.css";

function Card({ item }: { item: GroupCompanyCard }) {
  const content = (
    <div className={styles.card}>
      <Image
        src={item.image}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className={styles.cardImage}
      />
      {item.comingSoon && <span className={styles.comingSoonBadge}>サイト準備中</span>}
      <span className={styles.cardLabel}>{item.title}</span>
    </div>
  );

  if (item.href) {
    return <Link href={item.href}>{content}</Link>;
  }
  return content;
}

export default function GroupCompanies({
  eyebrow = "グループ企業",
  title = "ポラリス·グループの各事業サイトをご覧ください！",
  domesticTitle = "日本国内企業",
  overseasTitle = "海外企業",
  domestic = defaultDomestic,
  overseas = defaultOverseas,
}: {
  eyebrow?: string;
  title?: string;
  domesticTitle?: string;
  overseasTitle?: string;
  domestic?: GroupCompanyCard[];
  overseas?: GroupCompanyCard[];
}) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <h2 className={styles.title}>{title}</h2>

        <h3 className={styles.groupTitle}>{domesticTitle}</h3>
        <div className={styles.grid}>
          {domestic.map((item) => (
            <Card key={item.title} item={item} />
          ))}
        </div>

        <h3 className={styles.groupTitle}>{overseasTitle}</h3>
        <div className={styles.grid}>
          {overseas.map((item) => (
            <Card key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
