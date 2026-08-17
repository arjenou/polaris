import type { CSSProperties } from "react";

/** A single shimmering placeholder block. Used directly for custom layouts,
 * or via the higher-level helpers below for common table/grid patterns. */
export function SkeletonBlock({
  width = "100%",
  height = 14,
  radius = 4,
  style,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: CSSProperties;
}) {
  return (
    <span
      className="skeleton-block"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

export type SkeletonCellKind =
  | "drag"
  | "thumb"
  | "thumb-wide"
  | "cover"
  | "text"
  | "text-block"
  | "badge"
  | "actions";

function SkeletonCell({ kind }: { kind: SkeletonCellKind }) {
  switch (kind) {
    case "drag":
      return <SkeletonBlock width={14} height={14} />;
    case "thumb":
      return <SkeletonBlock width={40} height={40} radius="50%" />;
    case "thumb-wide":
      return <SkeletonBlock width={112} height={52} radius={6} />;
    case "cover":
      return <SkeletonBlock width={72} height={48} radius={6} />;
    case "text-block":
      return (
        <span style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <SkeletonBlock width="55%" height={14} />
          <SkeletonBlock width="80%" height={11} />
        </span>
      );
    case "badge":
      return <SkeletonBlock width={64} height={20} radius={999} />;
    case "actions":
      return (
        <span style={{ display: "flex", gap: 12 }}>
          <SkeletonBlock width={28} height={13} />
          <SkeletonBlock width={28} height={13} />
        </span>
      );
    case "text":
    default:
      return <SkeletonBlock width="70%" height={14} />;
  }
}

/** Renders `rows` placeholder `<tr>`s matching a real table's column layout,
 * to use as the `<tbody>` content while a list page's data is loading. */
export function SkeletonTableRows({
  columns,
  rows = 5,
}: {
  columns: SkeletonCellKind[];
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {columns.map((kind, colIndex) => (
            <td key={colIndex}>
              <SkeletonCell kind={kind} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Placeholder grid matching .gallery-preview-grid, for the page-galleries
 * image manager while its data is loading. */
export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="gallery-preview-grid">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonBlock key={index} height={90} radius={6} />
      ))}
    </div>
  );
}
