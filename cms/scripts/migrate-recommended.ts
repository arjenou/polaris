/**
 * One-time migration: seeds the new `recommended_posts` table with the 3
 * "おすすめ情報" cards that used to be hardcoded in src/data/home.ts /
 * home.zh.ts, uploading their images to the polaris-cms-media R2 bucket
 * (same bucket/pattern as migrate-news.ts).
 *
 * Usage: npm run migrate:recommended
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { imageSize } from "image-size";

const CMS_ROOT = path.resolve(import.meta.dirname, "..");
const REPO_ROOT = path.resolve(CMS_ROOT, "..");
const PUBLIC_DIR = path.join(REPO_ROOT, "public");
const SEED_SQL_PATH = path.join(CMS_ROOT, "migrations-data", "recommended-seed.sql");

const TODAY = new Date().toISOString().slice(0, 10).replace(/-/g, ".");

interface SeedItem {
  slug: string;
  imagePublicPath: string;
  ja: { tag: string; title: string; excerpt: string };
  zh: { tag: string; title: string; excerpt: string };
}

// Copied verbatim from the previous hardcoded src/data/home.ts / home.zh.ts.
const ITEMS: SeedItem[] = [
  {
    slug: "trademark-notice",
    imagePublicPath: "/images/home/recommend-1.png",
    ja: {
      tag: "不動産取引",
      title: "商標登録に関するご報告とご注意",
      excerpt: "客様、取引先様 業界関係者各位：...",
    },
    zh: {
      tag: "不动产买卖·中介",
      title: "商标注册公告",
      excerpt: "各位客户、合作方及业界相关人士……",
    },
  },
  {
    slug: "careers",
    imagePublicPath: "/images/home/recommend-2.png",
    ja: {
      tag: "その他",
      title: "ポラリス・グループキャリア採用情報",
      excerpt: "ポラリス・グループは事業の急速な拡大に...",
    },
    zh: {
      tag: "其他",
      title: "Polaris集团招聘信息",
      excerpt: "Polaris集团正随着业务的快速扩张……",
    },
  },
  {
    slug: "minato-office",
    imagePublicPath: "/images/home/recommend-3.png",
    ja: {
      tag: "創業支援",
      title: "港区｜自社運営レンタルオフィス入居者募集中",
      excerpt: "港区は東京の中心に位置するハイグレード...",
    },
    zh: {
      tag: "创业支援",
      title: "港区｜自有共享办公室火热招租中",
      excerpt: "港区位于东京中心地带，是高端商务区……",
    },
  },
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
  const key = `recommended${publicImagePath.replace(/^\/images\/home/, "")}`;

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

  for (const item of ITEMS) {
    const image = uploadImage(item.imagePublicPath);

    for (const locale of ["ja", "zh"] as const) {
      const { tag, title, excerpt } = item[locale];
      const content = `<p>${excerpt}</p>`;

      const values = [
        `'${locale}'`,
        `'${sqlEscape(item.slug)}'`,
        `'${sqlEscape(title)}'`,
        `'${TODAY}'`,
        `'${sqlEscape(tag)}'`,
        `'${sqlEscape(excerpt)}'`,
        `'${sqlEscape(content)}'`,
        image ? `'${sqlEscape(image.key)}'` : "NULL",
        image ? String(image.width) : "NULL",
        image ? String(image.height) : "NULL",
        "1",
      ].join(", ");

      statements.push(
        `INSERT INTO recommended_posts (locale, slug, title, date, tag, excerpt, content, image_key, image_width, image_height, published) VALUES (${values});`,
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
