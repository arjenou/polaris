/**
 * One-time migration: seeds the new `home_hero_slides` table with the 5
 * background photos that used to be hardcoded as `heroSlides` in
 * src/data/home.ts, uploading them to the polaris-cms-media R2 bucket (same
 * pattern as migrate-page-galleries.ts). The headline text itself is already
 * seeded directly by the 0014_home_hero.sql migration, so this script only
 * handles the images.
 *
 * Usage: npm run migrate:home-hero
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { imageSize } from "image-size";

const CMS_ROOT = path.resolve(import.meta.dirname, "..");
const REPO_ROOT = path.resolve(CMS_ROOT, "..");
const PUBLIC_DIR = path.join(REPO_ROOT, "public");
const SEED_SQL_PATH = path.join(CMS_ROOT, "migrations-data", "home-hero-seed.sql");

const HERO_IMAGES = [
  "/images/home/hero-1.jpg",
  "/images/home/hero-2.jpg",
  "/images/home/hero-3.jpg",
  "/images/home/hero-4.jpg",
  "/images/home/hero-5.jpg",
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
  const key = `home-hero${publicImagePath.replace(/^\/images\/home/, "")}`;

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

  return { key, width: width ?? 1920, height: height ?? 1080 };
}

function insertStatement(image: { key: string; width: number; height: number }, sortOrder: number): string {
  return `INSERT INTO home_hero_slides (image_key, image_width, image_height, sort_order) VALUES ('${sqlEscape(image.key)}', ${image.width}, ${image.height}, ${sortOrder});`;
}

function main() {
  const statements: string[] = [];

  const images = HERO_IMAGES.map(uploadImage).filter(
    (img): img is { key: string; width: number; height: number } => img !== null,
  );
  images.forEach((image, index) => statements.push(insertStatement(image, index)));

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
