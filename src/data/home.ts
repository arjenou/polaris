export interface HeroSlide {
  image: string;
  objectPosition?: { x: number; y: number };
}

export const heroSlides: HeroSlide[] = [
  { image: "/images/home/hero-1.jpg" },
  { image: "/images/home/hero-2.jpg" },
  { image: "/images/home/hero-3.jpg" },
  { image: "/images/home/hero-4.jpg" },
  { image: "/images/home/hero-5.jpg" },
];

export const heroHeadline = "境を乗り越え、道を切り拓く";

export interface NewsItem {
  date: string;
  tag: string;
  title: string;
  href: string;
}

export const newsItems: NewsItem[] = [
  {
    date: "2025.08.09",
    tag: "お知らせ",
    title: "お盆休みお知らせ",
    href: "/news/obon-2025",
  },
  {
    date: "2025.05.13",
    tag: "お知らせ",
    title: "マンスリーマンション事業展開",
    href: "/news/monthly-mansion-expansion",
  },
];

export interface RecommendedItem {
  tag: string;
  title: string;
  excerpt: string;
  image: string | null;
  href: string;
}

export const recommendedItems: RecommendedItem[] = [
  {
    tag: "不動産取引",
    title: "商標登録に関するご報告とご注意",
    excerpt: "客様、取引先様 業界関係者各位：...",
    image: "/images/home/recommend-1.png",
    href: "/news/trademark-notice",
  },
  {
    tag: "その他",
    title: "ポラリス・グループキャリア採用情報",
    excerpt: "ポラリス・グループは事業の急速な拡大に...",
    image: "/images/home/recommend-2.png",
    href: "/news/careers",
  },
  {
    tag: "創業支援",
    title: "港区｜自社運営レンタルオフィス入居者募集中",
    excerpt: "港区は東京の中心に位置するハイグレード...",
    image: "/images/home/recommend-3.png",
    href: "/news/minato-office",
  },
];

export interface GroupCompanyCard {
  title: string;
  image: string;
  href?: string;
  comingSoon?: boolean;
}

export const domesticCompanies: GroupCompanyCard[] = [
  {
    title: "不動産買取再贩・不動産仲介全般",
    image: "/images/home/group-nexus.png",
    href: "/business-headquarters",
  },
  {
    title: "赁貨管理・建物管理・リーシング",
    image: "/images/home/group-property.png",
    href: "/assets-management",
  },
  {
    title: "マンスリーマンションの運営",
    image: "/images/home/group-arknest.png",
    comingSoon: true,
  },
  {
    title: "民泊旅館ホテル清掃・建物清掃・退室清掃",
    image: "/images/home/group-kawara.png",
    comingSoon: true,
  },
  {
    title: "創業経営支援・レンタルオフィスの運営",
    image: "/images/home/group-takagi.png",
    comingSoon: true,
  },
  {
    title: "行政書士業務全般",
    image: "/images/home/group-myoken.png",
    comingSoon: true,
  },
];

export const overseasCompanies: GroupCompanyCard[] = [
  {
    title: "日本移住支援・日本投資企画・海外ビジネス開発",
    image: "/images/home/group-shanghai.png",
    comingSoon: true,
  },
];
