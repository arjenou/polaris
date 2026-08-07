import Image from "next/image";
import styles from "./ComingSoon.module.css";

export default function ComingSoon({
  image,
  title = "メンテナンス中",
  body,
}: {
  image: string;
  title?: string;
  body: string;
}) {
  return (
    <section className={styles.hero}>
      <Image src={image} alt="" fill priority sizes="100vw" className={styles.image} />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.body}>{body}</p>
      </div>
    </section>
  );
}
