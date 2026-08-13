/**
 * One-time migration: reads the legacy markdown news posts from
 * `content/posts/{ja,zh}/*.md` + their images in `public/`, uploads the
 * images to the polaris-cms-media R2 bucket, and generates a SQL seed file
 * that is applied to the remote D1 database.
 *
 * Usage: npm run migrate:news
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import matter from "gray-matter";
import { imageSize } from "image-size";

const CMS_ROOT = path.resolve(import.meta.dirname, "..");
const REPO_ROOT = path.resolve(CMS_ROOT, "..");
const POSTS_DIR = path.join(REPO_ROOT, "content", "posts");
const PUBLIC_DIR = path.join(REPO_ROOT, "public");
const SEED_SQL_PATH = path.join(CMS_ROOT, "migrations-data", "news-seed.sql");

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

interface Frontmatter {
  title: string;
  date: string;
  tag: string;
  image: string;
  excerpt: string;
}

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
  const key = `news${publicImagePath.replace(/^\/images\/news/, "")}`;

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

function main() {
  const statements: string[] = [];

  for (const locale of ["ja", "zh"] as const) {
    const dir = path.join(POSTS_DIR, locale);
    if (!fs.existsSync(dir)) continue;

    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const slug = file.replace(/\.md$/, "");
      const fullPath = path.join(dir, file);
      const raw = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(raw);
      const frontmatter = data as Frontmatter;

      const image = uploadImage(frontmatter.image);

      const values = [
        `'${locale}'`,
        `'${sqlEscape(slug)}'`,
        `'${sqlEscape(frontmatter.title)}'`,
        `'${sqlEscape(frontmatter.date)}'`,
        `'${sqlEscape(frontmatter.tag)}'`,
        `'${sqlEscape(frontmatter.excerpt)}'`,
        `'${sqlEscape(content.trim())}'`,
        image ? `'${sqlEscape(image.key)}'` : "NULL",
        image ? String(image.width) : "NULL",
        image ? String(image.height) : "NULL",
        "1",
      ].join(", ");

      statements.push(
        `INSERT INTO news_posts (locale, slug, title, date, tag, excerpt, content, image_key, image_width, image_height, published) VALUES (${values});`,
      );
    }
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
