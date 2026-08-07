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
        <Image
          src={badge}
          alt=""
          width={160}
          height={64}
          className={styles.badge}
        />
        <h2 className={styles.title}>{title}</h2>
        {paragraphs.map((p) => (
          <p key={p.slice(0, 12)} className={styles.paragraph}>
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
