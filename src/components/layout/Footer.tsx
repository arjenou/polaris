import Image from "next/image";
import { site } from "@/data/site";
import styles from "./Footer.module.css";

export default function Footer({ locale = "ja" }: { locale?: "ja" | "zh" }) {
  const isZh = locale === "zh";
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <Image
            src={site.footerLogo}
            alt={site.nameEn}
            width={200}
            height={67}
            className={styles.logo}
          />
          <div className={styles.companyBlock}>
            <h3>{isZh ? site.nameZh : site.name}</h3>
            <p>{isZh ? site.addressZh : site.address}</p>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>{site.companies}</span>
          <a href={site.beianUrl} target="_blank" rel="noopener noreferrer">
            {site.beianText}
          </a>
        </div>
        <div className={styles.bottom} style={{ paddingTop: 4 }}>
          <span>
            {isZh
              ? `© ${new Date().getFullYear()} Polaris Group. 保留所有权利。`
              : `© ${new Date().getFullYear()} Polaris Group. All rights reserved.`}
          </span>
        </div>
      </div>
    </footer>
  );
}
