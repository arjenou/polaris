/**
 * One-time migration: seeds the new `group_companies` table with the
 * "グループ企業紹介" cards that used to be hardcoded in
 * src/data/pages/groupInfo.ts / groupInfo.zh.ts, uploading their logo images
 * to the polaris-cms-media R2 bucket (same pattern as the other migrate-*
 * scripts). Images are identical between ja/zh, so each is uploaded once and
 * reused for both locale rows.
 *
 * Usage: npm run migrate:group-companies
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { imageSize } from "image-size";

const CMS_ROOT = path.resolve(import.meta.dirname, "..");
const REPO_ROOT = path.resolve(CMS_ROOT, "..");
const PUBLIC_DIR = path.join(REPO_ROOT, "public");
const SEED_SQL_PATH = path.join(CMS_ROOT, "migrations-data", "group-companies-seed.sql");

interface CompanySeed {
  name: string;
  business: string;
  address: string;
  imagePath: string;
  href?: string;
  comingSoon?: boolean;
}

const DOMESTIC_JA: CompanySeed[] = [
  {
    name: "ポラリス・ネクスト株式会社",
    business: "実需物件買取再販・収益物件買取再販・不動産仲介全般・リノベーション・リフォーム",
    address: "東京都千代田区麴町３丁目５−１５ 得水ビル 5F",
    imagePath: "/images/pages/group-info/company-nexus.png",
    href: "/business-headquarters",
  },
  {
    name: "ポラリス・プロパティ株式会社",
    business: "リーシング・賃貸管理（PM）・建物管理（BM）",
    address: "東京都千代田区麴町３丁目５−１５ 得水ビル 5F",
    imagePath: "/images/pages/group-info/company-property.png",
    href: "/assets-management",
  },
  {
    name: "ArkNest株式会社",
    business: "マンスリーマンションの運営",
    address: "東京都新宿区百人町1-18-8大久保カドビル903-A",
    imagePath: "/images/pages/group-info/company-arknest.png",
    comingSoon: true,
  },
  {
    name: "川禾株式会社",
    business: "民泊旅館ホテル清掃・建物共用部清掃・退室清掃",
    address: "東京都新宿区百人町1-18-8大久保カドビル903-B",
    imagePath: "/images/pages/group-info/company-kawara.png",
    comingSoon: true,
  },
  {
    name: "喬木商事合同会社",
    business: "起業家向け創業経営支援・レンタルオフィスの運営",
    address: "東京都新宿区百人町1-18-8大久保カドビル903-C",
    imagePath: "/images/pages/group-info/company-takagi.png",
    comingSoon: true,
  },
  {
    name: "妙見行政書士事務所",
    business: "行政書士業務全般",
    address: "東京都新宿区百人町1-18-8大久保カドビル903-D",
    imagePath: "/images/pages/group-info/company-myoken.png",
    comingSoon: true,
  },
];

const OVERSEAS_JA: CompanySeed[] = [
  {
    name: "妙見川禾（上海）商務諮詢有限公司",
    business: "日本移住支援・日本投資企画・海外ビジネス開発",
    address: "中国上海市长宁区SOHO天山广场T2座 5F",
    imagePath: "/images/pages/group-info/company-shanghai.png",
    comingSoon: true,
  },
];

const DOMESTIC_ZH: CompanySeed[] = [
  {
    name: "Polaris Next株式会社",
    business: "投资及自住不动产买卖・全方位不动产中介",
    address: "東京都千代田区麴町３丁目５−１５ 得水ビル 5F",
    imagePath: "/images/pages/group-info/company-nexus.png",
    href: "/zh/business-headquarters",
  },
  {
    name: "Polaris Property株式会社",
    business: "资产管理・收益资产管理（PM）・建筑设备管理（BM）",
    address: "東京都千代田区麴町３丁目５−１５ 得水ビル 5F",
    imagePath: "/images/pages/group-info/company-property.png",
    href: "/zh/assets-management",
  },
  {
    name: "ArkNest株式会社",
    business: "短租公寓运营",
    address: "東京都新宿区百人町1-18-8大久保カドビル903-A",
    imagePath: "/images/pages/group-info/company-arknest.png",
    comingSoon: true,
  },
  {
    name: "川禾株式会社",
    business: "民宿、旅馆、酒店客房清扫服务・建筑物公共区域清扫服务",
    address: "東京都新宿区百人町1-18-8大久保カドビル903-B",
    imagePath: "/images/pages/group-info/company-kawara.png",
    comingSoon: true,
  },
  {
    name: "喬木商事合同会社",
    business: "为创业者提供全方位创业经营支持・共享办公室的运营",
    address: "東京都新宿区百人町1-18-8大久保カドビル903-C",
    imagePath: "/images/pages/group-info/company-takagi.png",
    comingSoon: true,
  },
  {
    name: "妙見行政書士事務所",
    business: "全方位行政书士业务",
    address: "東京都新宿区百人町1-18-8大久保カドビル903-D",
    imagePath: "/images/pages/group-info/company-myoken.png",
    comingSoon: true,
  },
];

const OVERSEAS_ZH: CompanySeed[] = [
  {
    name: "妙见川禾（上海）商务咨询有限公司",
    business: "移民规划・赴日投资策划・海外商务拓展服务",
    address: "中国上海市长宁区SOHO天山广场T2座 5F",
    imagePath: "/images/pages/group-info/company-shanghai.png",
    comingSoon: true,
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

const uploadedImageCache = new Map<string, { key: string; width: number; height: number } | null>();

function uploadImage(publicImagePath: string): { key: string; width: number; height: number } | null {
  if (uploadedImageCache.has(publicImagePath)) return uploadedImageCache.get(publicImagePath)!;

  const localPath = path.join(PUBLIC_DIR, publicImagePath);
  if (!fs.existsSync(localPath)) {
    console.warn(`⚠️  Image not found, skipping: ${localPath}`);
    uploadedImageCache.set(publicImagePath, null);
    return null;
  }

  const ext = path.extname(localPath).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";
  const key = `group-companies${publicImagePath.replace(/^\/images\/pages\/group-info/, "")}`;

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

  const result = { key, width: width ?? 818, height: height ?? 322 };
  uploadedImageCache.set(publicImagePath, result);
  return result;
}

function insertStatement(locale: string, region: string, item: CompanySeed, sortOrder: number): string {
  const image = uploadImage(item.imagePath);
  const imageKey = image ? `'${sqlEscape(image.key)}'` : "NULL";
  const imageWidth = image ? String(image.width) : "NULL";
  const imageHeight = image ? String(image.height) : "NULL";
  const href = item.href ? `'${sqlEscape(item.href)}'` : "NULL";
  return `INSERT INTO group_companies (locale, region, name, business, address, image_key, image_width, image_height, href, coming_soon, sort_order) VALUES ('${locale}', '${region}', '${sqlEscape(item.name)}', '${sqlEscape(item.business)}', '${sqlEscape(item.address)}', ${imageKey}, ${imageWidth}, ${imageHeight}, ${href}, ${item.comingSoon ? 1 : 0}, ${sortOrder});`;
}

function main() {
  const statements: string[] = [];

  DOMESTIC_JA.forEach((item, index) => statements.push(insertStatement("ja", "domestic", item, index)));
  OVERSEAS_JA.forEach((item, index) => statements.push(insertStatement("ja", "overseas", item, index)));
  DOMESTIC_ZH.forEach((item, index) => statements.push(insertStatement("zh", "domestic", item, index)));
  OVERSEAS_ZH.forEach((item, index) => statements.push(insertStatement("zh", "overseas", item, index)));

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
