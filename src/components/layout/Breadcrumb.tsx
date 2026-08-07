import Link from "next/link";
import styles from "./Breadcrumb.module.css";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className={styles.breadcrumb} aria-label="breadcrumb">
      <div className={styles.inner}>
        <ol className={styles.list}>
          {items.map((item, index) => (
            <li key={item.label} className={styles.item}>
              {item.href ? (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span className={styles.current}>{item.label}</span>
              )}
              {index < items.length - 1 && (
                <span className={styles.separator} aria-hidden="true">
                  ›
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
