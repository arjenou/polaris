/**
 * One-time migration: seeds the new `page_gallery_images` table with the
 * photos that used to be hardcoded in src/data/pages/realEstate.ts /
 * assetsManagement.ts, uploading them to the polaris-cms-media R2 bucket
 * (same pattern as migrate-news.ts / migrate-team.ts / migrate-events.ts).
 *
 * Per product decision, 不動産取引 (real-estate) and リノベーション (renovation)
 * are now independently manageable pages even though they previously shared
 * the exact same 5 photos — so this script uploads those 5 files once and
 * inserts two independent sets of rows (one per pageKey) pointing at the same
 * uploaded R2 objects. 不動産管理 (asset-management) gets its own 3 photos.
 *
 * Usage: npm run migrate:page-galleries
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { imageSize } from "image-size";

const CMS_ROOT = path.resolve(import.meta.dirname, "..");
const REPO_ROOT = path.resolve(CMS_ROOT, "..");
const PUBLIC_DIR = path.join(REPO_ROOT, "public");
const SEED_SQL_PATH = path.join(CMS_ROOT, "migrations-data", "page-galleries-seed.sql");

const REAL_ESTATE_IMAGES = [
  "/images/pages/real-estate/gallery/slide-1.jpg",
  "/images/pages/real-estate/gallery/slide-2.jpg",
  "/images/pages/real-estate/gallery/slide-3.jpg",
  "/images/pages/real-estate/gallery/slide-4.jpg",
  "/images/pages/real-estate/gallery/slide-5.jpg",
];

const ASSET_MANAGEMENT_IMAGES = [
  "/images/pages/assets-management/gallery/slide-1.jpg",
  "/images/pages/assets-management/gallery/slide-2.jpg",
  "/images/pages/assets-management/gallery/slide-3.jpg",
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

function uploadImage(publicImagePath: string): { key: string; width: number; height: number } | null {
  const localPath = path.join(PUBLIC_DIR, publicImagePath);
  if (!fs.existsSync(localPath)) {
    console.warn(`⚠️  Image not found, skipping: ${localPath}`);
    return null;
  }

  const ext = path.extname(localPath).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";
  const key = `page-galleries${publicImagePath.replace(/^\/images\/pages/, "")}`;

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

  return { key, width: width ?? 1200, height: height ?? 800 };
}

function insertStatement(
  pageKey: string,
  image: { key: string; width: number; height: number },
  sortOrder: number,
): string {
  return `INSERT INTO page_gallery_images (page_key, image_key, image_width, image_height, sort_order) VALUES ('${pageKey}', '${sqlEscape(image.key)}', ${image.width}, ${image.height}, ${sortOrder});`;
}

function main() {
  const statements: string[] = [];

  const realEstateImages = REAL_ESTATE_IMAGES.map(uploadImage).filter(
    (img): img is { key: string; width: number; height: number } => img !== null,
  );
  realEstateImages.forEach((image, index) => {
    statements.push(insertStatement("real-estate", image, index));
    statements.push(insertStatement("renovation", image, index));
  });

  const assetManagementImages = ASSET_MANAGEMENT_IMAGES.map(uploadImage).filter(
    (img): img is { key: string; width: number; height: number } => img !== null,
  );
  assetManagementImages.forEach((image, index) => {
    statements.push(insertStatement("asset-management", image, index));
  });

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
