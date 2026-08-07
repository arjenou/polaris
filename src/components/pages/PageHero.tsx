import Image from "next/image";
import styles from "./PageHero.module.css";

export default function PageHero({
  image,
  title,
}: {
  image: string;
  title: string;
}) {
  return (
    <section className={styles.hero}>
      <Image src={image} alt="" fill priority sizes="100vw" className={styles.image} />
      <div className={styles.overlay}>
        <h1 className={styles.title}>{title}</h1>
      </div>
    </section>
  );
}
