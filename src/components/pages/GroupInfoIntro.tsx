import Image from "next/image";
import styles from "./GroupInfoIntro.module.css";

export default function GroupInfoIntro({
  badge,
  title,
  paragraphs,
}: {
  badge: string;
  title: string;
  paragraphs: string[];
}) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.heading}>
          <h2 className={styles.title}>{title}</h2>
          <span className={styles.titleEn}>／Polaris Group</span>
        </div>
        <div className={styles.watermarkWrap}>
          <Image
            src={badge}
            alt=""
            width={640}
            height={105}
            className={styles.watermark}
          />
        </div>
        {paragraphs.map((p) => (
          <p key={p.slice(0, 12)} className={styles.paragraph}>
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
