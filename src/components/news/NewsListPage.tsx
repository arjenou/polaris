import Image from "next/image";
import Link from "next/link";
import type { PostSummary } from "@/lib/posts";
import styles from "./NewsListPage.module.css";

export interface NewsListLabels {
  heroTitle: string;
  empty: string;
}

export default function NewsListPage({
  posts,
  basePath,
  labels,
}: {
  posts: PostSummary[];
  basePath: string;
  labels: NewsListLabels;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h1 className={styles.pageTitle}>{labels.heroTitle}</h1>

        {posts.length === 0 ? (
          <p className={styles.empty}>{labels.empty}</p>
        ) : (
          <div className={styles.grid}>
            {posts.map((post) => (
              <Link key={post.slug} href={`${basePath}/${post.slug}`} className={styles.card}>
                {post.image && (
                  <div className={styles.imageWrap}>
                    <Image
                      src={post.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className={styles.image}
                    />
                  </div>
                )}
                <div className={styles.cardBody}>
                  <div className={styles.meta}>
                    <span className={styles.date}>{post.date}</span>
                    <span className={styles.tag}>{post.tag}</span>
                  </div>
                  <h2 className={styles.cardTitle}>{post.title}</h2>
                  <p className={styles.excerpt}>{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
