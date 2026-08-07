import Link from "next/link";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage({
  eyebrow = "404",
  title,
  body,
  homeHref,
  homeLabel,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  homeHref: string;
  homeLabel: string;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.code}>{eyebrow}</div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.body}>{body}</p>
        <Link href={homeHref} className={styles.homeLink}>
          {homeLabel}
        </Link>
      </div>
    </section>
  );
}
