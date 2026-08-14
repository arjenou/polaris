/**
 * One-time migration: seeds the new `page_advantages` table with the
 * "私たちが選ばれる理由" items that used to be hardcoded in
 * src/data/pages/realEstate.ts / realEstate.zh.ts / assetsManagement.ts /
 * assetsManagement.zh.ts, uploading their images to the polaris-cms-media R2
 * bucket (same pattern as migrate-page-galleries.ts).
 *
 * Per product decision, 不動産取引 (real-estate) and リノベーション (renovation)
 * are independently manageable pages even though they previously shared the
 * exact same content — so this script uploads the 3 real-estate images once
 * and inserts matching rows under both pageKeys (ja + zh each).
 * 不動産管理 (asset-management) gets its own 3 items.
 *
 * Usage: npm run migrate:page-advantages
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { imageSize } from "image-size";

const CMS_ROOT = path.resolve(import.meta.dirname, "..");
const REPO_ROOT = path.resolve(CMS_ROOT, "..");
const PUBLIC_DIR = path.join(REPO_ROOT, "public");
const SEED_SQL_PATH = path.join(CMS_ROOT, "migrations-data", "page-advantages-seed.sql");

interface AdvantageSeed {
  badge: string;
  heading: string;
  body: string;
  imagePath: string;
}

const REAL_ESTATE_JA: AdvantageSeed[] = [
  {
    badge: "ADVANTAGE 1",
    heading: "誇りある実績",
    body: "実需物件でも収益物件でも、豊富な実績と専門知識に基づき、最適な不動産取引をサポートいたします。2024年間売買実績は100件超、賃貸仲介件数は400件以上。確かな実績が私たちの強みです。宅建士および司法書士が全行程を厳格に管理し、安心・安全な取引を徹底しています。物件選定から契約・引き渡しまで、ワンストップで丁寧にサポートし、安心してご購入・ご投資いただけます。",
    imagePath: "/images/pages/real-estate/advantage-1.png",
  },
  {
    badge: "ADVANTAGE 2",
    heading: "実績で信頼を獲得",
    body: "2024年、内装事業部は売上高1億円の突破を目前に控え、【株式会社アイダ設計】および【株式会社オーペンハウス】の2社上場企業と戦略的パートナーシップを締結しました。当社は上場企業の基準を自らに課し、施工・品質・サービスの細部に至るまで徹底した管理を行い、高品質・高効率・高満足のプロジェクト成果を実現しています。今後も専門性をさらに磨き、より高い基準でお客様に貢献し、頼される空間ソリューションパートナーを目指してまいります。",
    imagePath: "/images/pages/real-estate/advantage-2.png",
  },
  {
    badge: "ADVANTAGE 3",
    heading: "業界からの評価",
    body: "不動産分野で7年にわたり実績を積み重ね、これまでに数千件を超える取引を通じて、確かな経験と専門性を培ってまいりました。お客様一人ひとりに最適な不動産ソリューションをご提供できる体制を整えています。また、グループ内の複数企業が連携し、情報の透明性、迅速な対応、安心感のあるサービスを強みに、業界内外から高い評価と厚い信頼をいただいています。",
    imagePath: "/images/pages/real-estate/advantage-3.png",
  },
];

const REAL_ESTATE_ZH: AdvantageSeed[] = [
  {
    badge: "ADVANTAGE 1",
    heading: "2024年成果",
    body: "无论自住购房还是投资置业，我们都拥有丰富实绩与专业经验。2024年成交买卖案件逾100件，租赁中介案件超过400件，实力有据。全程由宅建士与司法书士严格把关，确保交易正规、安全、无忧。从房源甄选到签约交付，提供一站式全流程支持，助您轻松实现购房与投资目标。",
    imagePath: "/images/pages/real-estate/advantage-1.png",
  },
  {
    badge: "ADVANTAGE 2",
    heading: "以实力赢信赖",
    body: "2024年，内装事业部营业额近1亿日元，并与【株式会社アイダ設計】、【株式会社オーペンハウス】两家上市企业达成战略合作。我们以上市企业标准严格自律，精细把控施工、品质与服务细节，致力于打造高品质、高效率、高满意度的项目成果。未来将持续深耕专业，以更高标准服务客户，成为值得信赖的空间解决方案伙伴。",
    imagePath: "/images/pages/real-estate/advantage-2.png",
  },
  {
    badge: "ADVANTAGE 3",
    heading: "业界的高度评价",
    body: "不动产领域七年深耕，凭借数以千计的不动产交易实绩，积累了扎实的经验与专业能力，为每一位客户量身定制最优解决方案。此外，得益于集团内部多企业的协作机制，以及在信息透明、响应迅速、服务安心等方面的卓越表现，我们赢得了业界与客户的高度评价与深厚信赖。",
    imagePath: "/images/pages/real-estate/advantage-3.png",
  },
];

const ASSET_MANAGEMENT_JA: AdvantageSeed[] = [
  {
    badge: "ADVANTAGE 1",
    heading: "優れた実績と経験",
    body: "2024年、当社が管理する不動産総資産は120億円を突破し、賃貸管理戸数も500戸を超え、確かな実績を積み重ねてまいりました。長年の経験と豊富な管理ノウハウを活かし、オーナー様には安定した賃貸運営と資産価値最大化をトータルでサポートいたします。現在もさらに多くの物件管理を受託し、管理規模・実績ともに日々拡大中です。安心して任せられる信頼できるパートナーとして、オーナー様の大切な資産を最大限に活かすお手伝いをいたします。",
    imagePath: "/images/pages/assets-management/advantage-1.png",
  },
  {
    badge: "ADVANTAGE 2",
    heading: "リーシング戦略",
    body: "長年の運用実績と地域特性に基づいた効果的な募集戦略により、高い入居率を維持しています。当社専属のプロフェッショナルな仲介チームが、オーナー様の物件の魅力を最大限に引き出し、迅速な成約を実現します。また、マーケティング面ではWEB掲載、写真撮影、ポータルサイト活用など、総合的なサポートを提供しています。安定した運用をご希望のオーナー様には、最適な体制でサポートいたします。",
    imagePath: "/images/pages/assets-management/advantage-2.png",
  },
  {
    badge: "ADVANTAGE 3",
    heading: "トータルサポート体制",
    body: "当グループは、内装、設備メンテナンス、清掃、税務代理などの専門子会社リソースを統合し、物件管理および日本における税務の課題を包括的に解決します。自社チームが連携し、原状回復、リノベーション、スペース改造などの一括サービスを提供し、迅速な対応と高品質な納品を実現します。また、記帳代行、決算、申告などの税務サポートを提供し、オーナー様の負担を軽減します。外部のサプライヤーに依存することなく、コストと品質管理において顕著な優位性を発揮し、安心してお任せいただける運営サポートを提供します。",
    imagePath: "/images/pages/assets-management/advantage-3.png",
  },
];

const ASSET_MANAGEMENT_ZH: AdvantageSeed[] = [
  {
    badge: "ADVANTAGE 1",
    heading: "管理实绩与专业实力",
    body: "截至2024年，我们托管不动产总值突破120亿日元，管理不动产500余户，专业实力行业领先。依托深厚经验与精细化管理，持续为客户实现日本资产价值的最大化。携手实力团队，稳步迈向更高收益。",
    imagePath: "/images/pages/assets-management/advantage-1.png",
  },
  {
    badge: "ADVANTAGE 2",
    heading: "招租推广战略",
    body: "依托多年积累的运营实绩与对区域市场的精准洞察，我们独家制定高效的招租方案，全面推动房产实现高入住率与优质收益回报。专业摄影、自媒体运营、门户平台推广等多元化手段，打造专业且完善的租赁支持体系。联合集团不动产中介团队协同作业，深度挖掘物件价值，快速高效成交。",
    imagePath: "/images/pages/assets-management/advantage-2.png",
  },
  {
    badge: "ADVANTAGE 3",
    heading: "全方位一站式服务体系",
    body: "集团整合内装、设备维护、清扫、税务代行等专业子公司资源，全面解决物业管理与在日税务难题。自有团队协同作业，提供原状修复、翻新整修、空间改造等一站式服务，实现高效响应与高品质交付。同时提供代记账、核账、申报等税务支持，免除业主后顾之忧。全程无需依赖外部供应商，具备显著的成本与品质管控优势，助力安心托管，专注资产收益。",
    imagePath: "/images/pages/assets-management/advantage-3.png",
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
  const key = `page-advantages${publicImagePath.replace(/^\/images\/pages/, "")}`;

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

  const result = { key, width: width ?? 1200, height: height ?? 800 };
  uploadedImageCache.set(publicImagePath, result);
  return result;
}

function insertStatement(pageKey: string, locale: string, item: AdvantageSeed, sortOrder: number): string {
  const image = uploadImage(item.imagePath);
  const imageKey = image ? `'${sqlEscape(image.key)}'` : "NULL";
  const imageWidth = image ? String(image.width) : "NULL";
  const imageHeight = image ? String(image.height) : "NULL";
  return `INSERT INTO page_advantages (page_key, locale, badge, heading, body, image_key, image_width, image_height, sort_order) VALUES ('${pageKey}', '${locale}', '${sqlEscape(item.badge)}', '${sqlEscape(item.heading)}', '${sqlEscape(item.body)}', ${imageKey}, ${imageWidth}, ${imageHeight}, ${sortOrder});`;
}

function main() {
  const statements: string[] = [];

  REAL_ESTATE_JA.forEach((item, index) => {
    statements.push(insertStatement("real-estate", "ja", item, index));
    statements.push(insertStatement("renovation", "ja", item, index));
  });
  REAL_ESTATE_ZH.forEach((item, index) => {
    statements.push(insertStatement("real-estate", "zh", item, index));
    statements.push(insertStatement("renovation", "zh", item, index));
  });
  ASSET_MANAGEMENT_JA.forEach((item, index) => {
    statements.push(insertStatement("asset-management", "ja", item, index));
  });
  ASSET_MANAGEMENT_ZH.forEach((item, index) => {
    statements.push(insertStatement("asset-management", "zh", item, index));
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
