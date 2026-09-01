/**
 * One-time migration: seeds the new `events` table with the 5 "社内イベント"
 * cards that used to be hardcoded in src/data/events.ts / events.zh.ts,
 * uploading their cover/hero/gallery images to the polaris-cms-media R2
 * bucket (same bucket/pattern as migrate-news.ts / migrate-team.ts).
 *
 * Slugs are kept identical to the previous hardcoded values so existing
 * /events/<slug> URLs keep working.
 *
 * Usage: npm run migrate:events
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { imageSize } from "image-size";

const CMS_ROOT = path.resolve(import.meta.dirname, "..");
const REPO_ROOT = path.resolve(CMS_ROOT, "..");
const PUBLIC_DIR = path.join(REPO_ROOT, "public");
const SEED_SQL_PATH = path.join(CMS_ROOT, "migrations-data", "events-seed.sql");

interface SeedOverview {
  eventName: string;
  datetime: string;
  venue: string;
  participants: string;
  content: string;
  organizer: string;
}

interface SeedLocaleText {
  title: string;
  badge: string;
  summary: string;
  overview: SeedOverview;
}

interface SeedEvent {
  slug: string;
  date: string;
  dateRange?: string;
  badgeColor: string;
  coverPublicPath: string;
  galleryPublicPaths?: string[];
  ja: SeedLocaleText;
  zh: SeedLocaleText;
}

// Copied verbatim from the previous hardcoded src/data/events.ts / events.zh.ts.
const EVENTS: SeedEvent[] = [
  {
    slug: "2026-summer-trip-chiba",
    date: "2026.07.19",
    dateRange: "2026.07.19 - 2026.07.20",
    badgeColor: "#1E6FD9",
    coverPublicPath: "/images/events/summer-trip-2026/hero.jpg",
    galleryPublicPaths: Array.from(
      { length: 8 },
      (_, i) => `/images/events/summer-trip-2026/gallery-${i + 1}.jpg`,
    ),
    ja: {
      title: "2026年 夏の社員旅行 in 千葉",
      badge: "社員旅行・懇親会",
      summary:
        "千葉の美しい海を望むロケーションで、1泊2日の社員旅行を開催しました。美味しいBBQやアクティビティを通して、部署を超えた交流が深まり、笑顔あふれる最高の時間となりました。",
      overview: {
        eventName: "みんなで楽しむBBQ懇親会2025",
        datetime: "2025年6月14日（土）11:00 - 16:00",
        venue: "東京ベイサイドガーデン",
        participants: "従業員および関係者 約120名",
        content: "BBQ、レクリエーション、交流タイムなど",
        organizer: "ポラリス・グループ 総務部",
      },
    },
    zh: {
      title: "2026年 夏季员工旅行 in 千叶",
      badge: "员工旅行・联谊会",
      summary:
        "在可以远眺千叶美丽海景的地点，我们举办了两天一夜的员工旅行。通过美味的BBQ和各类活动，加深了跨部门的交流，度过了充满欢声笑语的美好时光。",
      overview: {
        eventName: "大家一起享受的BBQ联谊会2025",
        datetime: "2025年6月14日（周六）11:00 - 16:00",
        venue: "东京湾畔花园",
        participants: "员工及相关人员 约120名",
        content: "BBQ、娱乐活动、交流时间等",
        organizer: "Polaris Group 总务部",
      },
    },
  },
  {
    slug: "2025-award-ceremony",
    date: "2025.12.20",
    badgeColor: "#C0392B",
    coverPublicPath: "/images/events/event-award-ceremony.jpg",
    ja: {
      title: "2025年度 年次表彰式",
      badge: "懇親会・表彰式",
      summary:
        "1年間の功績を称える年次表彰式を開催しました。優秀な成果を上げたメンバーを表彰し、皆で1年間の頑張りを労いました。",
      overview: {
        eventName: "2025年度 年次表彰式",
        datetime: "2025年12月20日（土）",
        venue: "都内ホテル宴会場",
        participants: "従業員および関係者",
        content: "表彰式、懇親会",
        organizer: "ポラリス・グループ 総務部",
      },
    },
    zh: {
      title: "2025年度 年度表彰大会",
      badge: "联谊会・表彰式",
      summary:
        "我们举办了表彰一年间业绩的年度表彰大会，对取得优异成绩的成员予以表彰，共同慰劳一年的辛勤付出。",
      overview: {
        eventName: "2025年度 年度表彰大会",
        datetime: "2025年12月20日（周六）",
        venue: "市内酒店宴会厅",
        participants: "员工及相关人员",
        content: "表彰仪式、联谊会",
        organizer: "Polaris Group 总务部",
      },
    },
  },
  {
    slug: "2025-hanami",
    date: "2025.04.05",
    badgeColor: "#D6336C",
    coverPublicPath: "/images/events/event-hanami.jpg",
    ja: {
      title: "お花見ランチ会",
      badge: "お花見",
      summary:
        "満開の桜の下で、部署の垣根を越えたランチ会を開催しました。春の訪れを感じながら、和やかなひとときを過ごしました。",
      overview: {
        eventName: "お花見ランチ会",
        datetime: "2025年4月5日（土）",
        venue: "都内公園",
        participants: "従業員および関係者",
        content: "お花見、ランチ交流会",
        organizer: "ポラリス・グループ 総務部",
      },
    },
    zh: {
      title: "赏花午餐会",
      badge: "赏花",
      summary: "在盛开的樱花树下，我们举办了跨部门的午餐交流会，一同感受春天的气息，度过了融洽愉快的时光。",
      overview: {
        eventName: "赏花午餐会",
        datetime: "2025年4月5日（周六）",
        venue: "市内公园",
        participants: "员工及相关人员",
        content: "赏花、午餐交流会",
        organizer: "Polaris Group 总务部",
      },
    },
  },
  {
    slug: "2025-bowling",
    date: "2025.02.22",
    badgeColor: "#1E6FD9",
    coverPublicPath: "/images/events/event-bowling.jpg",
    ja: {
      title: "ボウリング大会",
      badge: "レクリエーション",
      summary: "チーム対抗のボウリング大会を開催しました。白熱した戦いの中で、部署を超えた交流が生まれました。",
      overview: {
        eventName: "社内ボウリング大会",
        datetime: "2025年2月22日（土）",
        venue: "都内ボウリング場",
        participants: "従業員および関係者",
        content: "チーム対抗ボウリング大会",
        organizer: "ポラリス・グループ 総務部",
      },
    },
    zh: {
      title: "保龄球大赛",
      badge: "娱乐活动",
      summary: "我们举办了团队对抗保龄球大赛，在激烈的较量中，促进了跨部门的交流。",
      overview: {
        eventName: "公司保龄球大赛",
        datetime: "2025年2月22日（周六）",
        venue: "市内保龄球馆",
        participants: "员工及相关人员",
        content: "团队对抗保龄球大赛",
        organizer: "Polaris Group 总务部",
      },
    },
  },
  {
    slug: "2024-bonenkai",
    date: "2024.12.26",
    badgeColor: "#1B2A4A",
    coverPublicPath: "/images/events/event-bonenkai.jpg",
    ja: {
      title: "2024年 忘年会",
      badge: "忘年会",
      summary: "1年間の労をねぎらう忘年会を開催しました。美味しい料理とともに、笑顔あふれる時間を過ごしました。",
      overview: {
        eventName: "2024年 忘年会",
        datetime: "2024年12月26日（木）",
        venue: "都内レストラン",
        participants: "従業員および関係者",
        content: "懇親会、抽選会",
        organizer: "ポラリス・グループ 総務部",
      },
    },
    zh: {
      title: "2024年 忘年会",
      badge: "忘年会",
      summary: "我们举办了慰劳一年辛苦付出的忘年会，与美味佳肴相伴，度过了充满欢声笑语的时光。",
      overview: {
        eventName: "2024年 忘年会",
        datetime: "2024年12月26日（周四）",
        venue: "市内餐厅",
        participants: "员工及相关人员",
        content: "联谊会、抽奖活动",
        organizer: "Polaris Group 总务部",
      },
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

function toGalleryJson(keys: string[]): string {
  return sqlEscape(JSON.stringify(keys));
}

function uploadImage(publicImagePath: string): { key: string; width: number; height: number } | null {
  const localPath = path.join(PUBLIC_DIR, publicImagePath);
  if (!fs.existsSync(localPath)) {
    console.warn(`⚠️  Image not found, skipping: ${localPath}`);
    return null;
  }

  const ext = path.extname(localPath).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";
  const key = `events${publicImagePath.replace(/^\/images\/events/, "")}`;

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

  for (const [eventIndex, event] of EVENTS.entries()) {
    const cover = uploadImage(event.coverPublicPath);
    const galleryKeys = (event.galleryPublicPaths ?? [])
      .map((p) => uploadImage(p))
      .filter((img): img is { key: string; width: number; height: number } => img !== null)
      .map((img) => img.key);

    for (const locale of ["ja", "zh"] as const) {
      const { title, badge, summary, overview } = event[locale];

      const values = [
        `'${locale}'`,
        `'${sqlEscape(event.slug)}'`,
        `'${sqlEscape(title)}'`,
        `'${event.date}'`,
        `'${sqlEscape(event.dateRange ?? "")}'`,
        `'${sqlEscape(badge)}'`,
        `'${event.badgeColor}'`,
        `'${sqlEscape(summary)}'`,
        cover ? `'${sqlEscape(cover.key)}'` : "NULL",
        cover ? String(cover.width) : "NULL",
        cover ? String(cover.height) : "NULL",
        "NULL", // hero_image_key: falls back to cover, same as before
        "NULL",
        "NULL",
        "''", // video_url: no real video source available from the old decorative flag
        `'${sqlEscape(overview.eventName)}'`,
        `'${sqlEscape(overview.datetime)}'`,
        `'${sqlEscape(overview.venue)}'`,
        `'${sqlEscape(overview.participants)}'`,
        `'${sqlEscape(overview.content)}'`,
        `'${sqlEscape(overview.organizer)}'`,
        `'${toGalleryJson(galleryKeys)}'`,
        "1",
        String(eventIndex),
      ].join(", ");

      statements.push(
        `INSERT INTO events (locale, slug, title, date, date_range, badge, badge_color, summary, cover_image_key, cover_image_width, cover_image_height, hero_image_key, hero_image_width, hero_image_height, video_url, overview_event_name, overview_datetime, overview_venue, overview_participants, overview_content, overview_organizer, gallery, published, sort_order) VALUES (${values});`,
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
