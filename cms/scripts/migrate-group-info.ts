/**
 * One-time migration: uploads the two shared images used by the グループ情報
 * (enterprise-intelligence) page — the page hero banner and the intro
 * section's watermark badge — to the polaris-cms-media R2 bucket, and points
 * the `group_info_assets` rows (seeded by 0015_group_info.sql) at them. The
 * text content itself (headline, intro paragraphs, section titles, timeline
 * entries) is already seeded directly by that migration.
 *
 * Usage: npm run migrate:group-info
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { imageSize } from "image-size";

const CMS_ROOT = path.resolve(import.meta.dirname, "..");
const REPO_ROOT = path.resolve(CMS_ROOT, "..");
const PUBLIC_DIR = path.join(REPO_ROOT, "public");
const SEED_SQL_PATH = path.join(CMS_ROOT, "migrations-data", "group-info-seed.sql");

const ASSETS: { type: "hero" | "badge"; imagePath: string }[] = [
  { type: "hero", imagePath: "/images/pages/group-info/banner.png" },
  { type: "badge", imagePath: "/images/pages/group-info/logo-badge.png" },
];

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function sqlEscape(value: string): string {
  return value.replace(/'/g, "''");
}

function uploadImage(publicImagePath: string, key: string): { key: string; width: number; height: number } | null {
  const localPath = path.join(PUBLIC_DIR, publicImagePath);
  if (!fs.existsSync(localPath)) {
    console.warn(`⚠️  Image not found, skipping: ${localPath}`);
    return null;
  }

  const ext = path.extname(localPath).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  const buffer = fs.readFileSync(localPath);
  const { width, height } = imageSize(buffer);

  console.log(`Uploading ${publicImagePath} -> ${key}`);
  execFileSync(
    "npx",
    [
      "wrangler",
      "r2",
      "object",
      "put",
      `polaris-cms-media/${key}`,
      `--file=${localPath}`,
      `--content-type=${contentType}`,
      "--remote",
    ],
    { cwd: CMS_ROOT, stdio: "inherit" },
  );

  return { key, width: width ?? 0, height: height ?? 0 };
}

function updateStatement(type: "hero" | "badge", image: { key: string; width: number; height: number }): string {
  return `UPDATE group_info_assets SET image_key = '${sqlEscape(image.key)}', image_width = ${image.width}, image_height = ${image.height}, updated_at = datetime('now') WHERE type = '${type}';`;
}

function main() {
  const statements: string[] = [];

  for (const asset of ASSETS) {
    const ext = path.extname(asset.imagePath);
    const key = `group-info/${asset.type}${ext}`;
    const image = uploadImage(asset.imagePath, key);
    if (image) statements.push(updateStatement(asset.type, image));
  }

  fs.mkdirSync(path.dirname(SEED_SQL_PATH), { recursive: true });
  fs.writeFileSync(SEED_SQL_PATH, statements.join("\n") + "\n", "utf8");
  console.log(`\nWrote ${statements.length} statements to ${SEED_SQL_PATH}`);

  console.log("\nApplying to remote D1 database...");
  execFileSync("npx", ["wrangler", "d1", "execute", "polaris-cms", "--remote", `--file=${SEED_SQL_PATH}`], {
    cwd: CMS_ROOT,
    stdio: "inherit",
  });

  console.log("\n✅ Migration complete.");
}

main();
