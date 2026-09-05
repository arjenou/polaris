import Image from "next/image";
import { site } from "@/data/site";
import { subsidiaries, type SubsidiaryKey } from "@/data/subsidiaries";
import styles from "./Footer.module.css";

export default function Footer({ subsidiary }: { subsidiary?: SubsidiaryKey }) {
  const sub = subsidiary ? subsidiaries[subsidiary] : undefined;
  const companyName = sub ? sub.name : site.name;
  const companyAddress = sub ? sub.address : site.address;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <Image
            src={site.footerLogo}
            alt={site.nameEn}
            width={280}
            height={94}
            className={styles.logo}
          />
          <span className={styles.divider} aria-hidden="true" />
          {sub && (
            <Image
              src={sub.image}
              alt={companyName}
              width={340}
              height={133}
              className={styles.subsidiaryLogo}
            />
          )}
          <div className={styles.companyBlock}>
            <h3>{companyName}</h3>
            <p>{companyAddress}</p>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>{site.companies}</span>
          <a href={site.beianUrl} target="_blank" rel="noopener noreferrer">
            {site.beianText}
          </a>
        </div>
        <div className={styles.bottom} style={{ paddingTop: 4 }}>
          <span>© {new Date().getFullYear()} Polaris Group. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
