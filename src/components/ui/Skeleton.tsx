import type { CSSProperties } from "react";
import styles from "./Skeleton.module.css";

/** Generic shimmering placeholder block. Composed by the per-section
 * *Skeleton components used as <Suspense> fallbacks / loading.tsx content
 * across the site, so a page's layout never jumps once real content
 * (fetched from the CMS) arrives. */
export default function Skeleton({
  width = "100%",
  height = 16,
  radius = 6,
  className,
  style,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={className ? `${styles.skeleton} ${className}` : styles.skeleton}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}
