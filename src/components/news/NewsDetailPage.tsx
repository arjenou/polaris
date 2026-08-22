import Link from "next/link";
import type { Post } from "@/lib/posts";
import styles from "./NewsDetailPage.module.css";

export interface NewsDetailLabels {
  backLabel: string;
}

export default function NewsDetailPage({
  post,
  basePath,
  labels,
}: {
  post: Post;
  basePath: string;
  labels: NewsDetailLabels;
}) {
  return (
    <article className={styles.section}>
      <div className={styles.inner}>
        <Link href={basePath} className={styles.back}>
          {labels.backLabel}
        </Link>

        <div className={styles.meta}>
          <span className={styles.date}>{post.date}</span>
          <span className={styles.tag}>{post.tag}</span>
        </div>

        <h1 className={styles.title}>{post.title}</h1>

        <div
          className={styles.body}
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        <Link href={basePath} className={styles.backBottom}>
          {labels.backLabel}
        </Link>
      </div>
    </article>
  );
}
