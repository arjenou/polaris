export interface EventOverview {
  eventName: string;
  datetime: string;
  venue: string;
  participants: string;
  content: string;
  organizer: string;
}

export interface CompanyEvent {
  slug: string;
  badge: string;
  badgeColor: string;
  title: string;
  date: string;
  photo: string;
  /** Full date range shown on the detail page (e.g. "2026.07.19 - 2026.07.20"). */
  dateRange?: string;
  /** Short lead paragraph shown under the title on the detail page. */
  summary?: string;
  /** Large image at the top of the detail page. Falls back to `photo`. */
  heroImage?: string;
  /** Shows a decorative play button over the hero image. */
  hasVideo?: boolean;
  overview?: EventOverview;
  gallery?: string[];
}

// NOTE: dates/photos are illustrative samples pending real event photos.
export const companyEvents: CompanyEvent[] = [
  {
    slug: "2026-summer-trip-chiba",
    badge: "社員旅行・懇親会",
    badgeColor: "#1E6FD9",
    title: "2026年 夏の社員旅行 in 千葉",
    date: "2026.07.19",
    photo: "/images/events/summer-trip-2026/hero.jpg",
    dateRange: "2026.07.19 - 2026.07.20",
    summary:
      "千葉の美しい海を望むロケーションで、1泊2日の社員旅行を開催しました。美味しいBBQやアクティビティを通して、部署を超えた交流が深まり、笑顔あふれる最高の時間となりました。",
    heroImage: "/images/events/summer-trip-2026/hero.jpg",
    hasVideo: true,
    overview: {
      eventName: "みんなで楽しむBBQ懇親会2025",
      datetime: "2025年6月14日（土）11:00 - 16:00",
      venue: "東京ベイサイドガーデン",
      participants: "従業員および関係者 約120名",
      content: "BBQ、レクリエーション、交流タイムなど",
      organizer: "ポラリス・グループ 総務部",
    },
    gallery: [
      "/images/events/summer-trip-2026/gallery-1.jpg",
      "/images/events/summer-trip-2026/gallery-2.jpg",
      "/images/events/summer-trip-2026/gallery-3.jpg",
      "/images/events/summer-trip-2026/gallery-4.jpg",
      "/images/events/summer-trip-2026/gallery-5.jpg",
      "/images/events/summer-trip-2026/gallery-6.jpg",
      "/images/events/summer-trip-2026/gallery-7.jpg",
      "/images/events/summer-trip-2026/gallery-8.jpg",
    ],
  },
  {
    slug: "2025-award-ceremony",
    badge: "懇親会・表彰式",
    badgeColor: "#C0392B",
    title: "2025年度 年次表彰式",
    date: "2025.12.20",
    photo: "/images/events/event-award-ceremony.jpg",
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
  {
    slug: "2025-hanami",
    badge: "お花見",
    badgeColor: "#D6336C",
    title: "お花見ランチ会",
    date: "2025.04.05",
    photo: "/images/events/event-hanami.jpg",
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
  {
    slug: "2025-bowling",
    badge: "レクリエーション",
    badgeColor: "#1E6FD9",
    title: "ボウリング大会",
    date: "2025.02.22",
    photo: "/images/events/event-bowling.jpg",
    summary:
      "チーム対抗のボウリング大会を開催しました。白熱した戦いの中で、部署を超えた交流が生まれました。",
    overview: {
      eventName: "社内ボウリング大会",
      datetime: "2025年2月22日（土）",
      venue: "都内ボウリング場",
      participants: "従業員および関係者",
      content: "チーム対抗ボウリング大会",
      organizer: "ポラリス・グループ 総務部",
    },
  },
  {
    slug: "2024-bonenkai",
    badge: "忘年会",
    badgeColor: "#1B2A4A",
    title: "2024年 忘年会",
    date: "2024.12.26",
    photo: "/images/events/event-bonenkai.jpg",
    summary:
      "1年間の労をねぎらう忘年会を開催しました。美味しい料理とともに、笑顔あふれる時間を過ごしました。",
    overview: {
      eventName: "2024年 忘年会",
      datetime: "2024年12月26日（木）",
      venue: "都内レストラン",
      participants: "従業員および関係者",
      content: "懇親会、抽選会",
      organizer: "ポラリス・グループ 総務部",
    },
  },
];
