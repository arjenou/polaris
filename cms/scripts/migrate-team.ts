/**
 * One-time migration: seeds the new `team_members` table with the 5
 * "社員紹介" cards that used to be hardcoded in src/data/team.ts, uploading
 * their avatars to the polaris-cms-media R2 bucket (same pattern as
 * migrate-news.ts / migrate-recommended.ts).
 *
 * Per product decision, ja/zh are independent content rows, but there was no
 * existing Chinese translation for team bios — so the zh rows are seeded as
 * an exact copy of the Japanese text (placeholder) for an editor to fix up
 * later in the admin, rather than a machine translation.
 *
 * Usage: npm run migrate:team
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { imageSize } from "image-size";

const CMS_ROOT = path.resolve(import.meta.dirname, "..");
const REPO_ROOT = path.resolve(CMS_ROOT, "..");
const PUBLIC_DIR = path.join(REPO_ROOT, "public");
const SEED_SQL_PATH = path.join(CMS_ROOT, "migrations-data", "team-seed.sql");

interface SeedMember {
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  department: string;
  position: string;
  description: string;
  tags: string[];
  languages: string[];
  imagePublicPath: string;
}

// Copied verbatim from the previous hardcoded src/data/team.ts.
const MEMBERS: SeedMember[] = [
  {
    lastName: "佐藤",
    firstName: "太郎",
    lastNameKana: "サトウ",
    firstNameKana: "タロウ",
    department: "営業部 チームリーダー",
    position: "/ 宅地建物取引士",
    description: "新築マンションの販売を得意とし、お客様のニーズに合わせた物件をご紹介します。",
    tags: ["売買仲介", "新築マンション"],
    languages: ["日本語", "英語"],
    imagePublicPath: "/images/team/staff-sato.jpg",
  },
  {
    lastName: "山田",
    firstName: "花子",
    lastNameKana: "ヤマダ",
    firstNameKana: "ハナコ",
    department: "営業部 マネージャー",
    position: "/ 宅地建物取引士 | 宅地建物取引士",
    description: "不動産業界で10年以上の経験を持ち、安心・丁寧なサポートを心がけています。",
    tags: ["売買仲介", "投資物件", "住宅ローン相談"],
    languages: ["日本語", "中国語", "英語"],
    imagePublicPath: "/images/team/staff-yamada.jpg",
  },
  {
    lastName: "田中",
    firstName: "明",
    lastNameKana: "タナカ",
    firstNameKana: "アキ",
    department: "営業部",
    position: "/ 宅地建物取引士",
    description: "不動産投資のアドバイザーとして、収益物件の選定から管理までサポートいたします。",
    tags: ["投資物件", "資産運用"],
    languages: ["日本語"],
    imagePublicPath: "/images/team/staff-tanaka.jpg",
  },
  {
    lastName: "鈴木",
    firstName: "美香",
    lastNameKana: "スズキ",
    firstNameKana: "ミカ",
    department: "営業部",
    position: "/ 宅地建物取引士",
    description: "中古住宅のリノベーション提案が得意です。住まいの価値を最大限に引き出します。",
    tags: ["リノベーション", "中古住宅"],
    languages: ["日本語", "中国語"],
    imagePublicPath: "/images/team/staff-suzuki.jpg",
  },
  {
    lastName: "渡辺",
    firstName: "浩",
    lastNameKana: "ワタナベ",
    firstNameKana: "ヒロシ",
    department: "営業部 シニアアドバイザー",
    position: "/ 宅地建物取引士 | FP2級",
    description: "20年以上の実績があり、特に資産運用としての不動産購入をサポートします。",
    tags: ["資産運用", "住宅ローン相談"],
    languages: ["日本語", "英語"],
    imagePublicPath: "/images/team/staff-watanabe.jpg",
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

function toTagsJson(values: string[]): string {
  return sqlEscape(JSON.stringify(values));
}

function uploadImage(publicImagePath: string): { key: string; width: number; height: number } | null {
  const localPath = path.join(PUBLIC_DIR, publicImagePath);
  if (!fs.existsSync(localPath)) {
    console.warn(`⚠️  Image not found, skipping: ${localPath}`);
    return null;
  }

  const ext = path.extname(localPath).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";
  const key = `team${publicImagePath.replace(/^\/images\/team/, "")}`;

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

  return { key, width: width ?? 400, height: height ?? 500 };
}

function main() {
  const statements: string[] = [];

  MEMBERS.forEach((member, index) => {
    const image = uploadImage(member.imagePublicPath);

    for (const locale of ["ja", "zh"] as const) {
      const values = [
        `'${locale}'`,
        `'${sqlEscape(member.lastName)}'`,
        `'${sqlEscape(member.firstName)}'`,
        `'${sqlEscape(member.lastNameKana)}'`,
        `'${sqlEscape(member.firstNameKana)}'`,
        `'${sqlEscape(member.department)}'`,
        `'${sqlEscape(member.position)}'`,
        `'${sqlEscape(member.description)}'`,
        `'${toTagsJson(member.tags)}'`,
        `'${toTagsJson(member.languages)}'`,
        image ? `'${sqlEscape(image.key)}'` : "NULL",
        image ? String(image.width) : "NULL",
        image ? String(image.height) : "NULL",
        String(index),
        "1",
      ].join(", ");

      statements.push(
        `INSERT INTO team_members (locale, last_name, first_name, last_name_kana, first_name_kana, department, position, description, tags, languages, image_key, image_width, image_height, sort_order, published) VALUES (${values});`,
      );
    }
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
