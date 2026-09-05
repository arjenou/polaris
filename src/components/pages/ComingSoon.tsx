import Image from "next/image";
import { formatObjectPosition, type ObjectPosition } from "@/lib/objectPosition";
import styles from "./ComingSoon.module.css";

export default function ComingSoon({
  image,
  title = "メンテナンス中",
  body,
  objectPosition,
}: {
  image: string;
  title?: string;
  body: string;
  objectPosition?: ObjectPosition | null;
}) {
  return (
    <section className={styles.hero}>
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className={styles.image}
        style={{ objectPosition: formatObjectPosition(objectPosition) }}
      />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.body}>{body}</p>
      </div>
    </section>
  );
}
