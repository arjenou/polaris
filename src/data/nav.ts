export interface NavSubItem {
  label: string;
  /** Optional dedicated page for this sub-item; falls back to the parent NavItem's href when omitted. */
  href?: string;
  /** Renders the sub-item label in bold, e.g. to highlight a newly published page. */
  bold?: boolean;
}

export interface NavGroup {
  heading: string;
  icon?: string;
  items: NavSubItem[];
  /** Shown alongside/instead of items when the sub-section has no page yet (matches the legacy site's "現在、サイトを準備中です" note). */
  comingSoon?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  /** Shown on the mega-menu title row when the section is not fully published yet. */
  comingSoon?: boolean;
  /** Pages that exist but were intentionally kept out of the public nav (kept for parity with the legacy site). */
  hidden?: boolean;
  /** Large banner image shown in the left column of the hover mega-menu, matching the legacy site's dropdown. */
  banner?: string;
  /** Group-company logo card shown next to the banner image (e.g. "Polaris Next", "Polaris Property"). */
  brand?: string;
  /** Hover mega-menu groups, matching the legacy site's raven-megamenu dropdown structure under each top-level item. */
  groups?: NavGroup[];
}

export const jaNavItems: NavItem[] = [
  { label: "ホーム", href: "/" },
  {
    label: "不動産取引",
    href: "/business-headquarters",
    banner: "/images/nav/banner-real-estate.png",
    brand: "/images/nav/brand-polaris-next.png",
    groups: [
      {
        heading: "不動産買取再販",
        icon: "/images/nav/icon-buy-resell.jpg",
        items: [{ label: "中古住宅再生" }, { label: "収益不動産買取再販" }],
      },
      {
        heading: "不動産仲介",
        icon: "/images/nav/icon-brokerage.jpg",
        items: [
          { label: "収益不動産投資企画" },
          { label: "住宅売買仲介" },
          { label: "賃貸仲介" },
        ],
      },
    ],
  },
  {
    label: "不動産管理",
    href: "/assets-management",
    banner: "/images/nav/banner-assets-management.jpg",
    brand: "/images/nav/brand-polaris-property.png",
    groups: [
      {
        heading: "賃貸管理（PM）",
        icon: "/images/nav/icon-pm.png",
        items: [
          { label: "PM収支管理" },
          { label: "リーシング業務" },
          { label: "入居者・テナント対応" },
          { label: "退去受付フォーム", href: "/move-out-request", bold: true },
        ],
      },
      {
        heading: "建物管理（BM）",
        icon: "/images/nav/icon-bm.png",
        items: [
          { label: "共用部環境管理" },
          { label: "法定点検" },
          { label: "建物設備メンテナンス" },
        ],
      },
    ],
  },
  {
    label: "リノベーション",
    href: "/business-headquarters-2",
    banner: "/images/nav/banner-renovation.png",
    brand: "/images/nav/brand-polaris-next.png",
    groups: [
      { heading: "リノベーション", icon: "/images/nav/icon-renovation.png", items: [] },
      { heading: "リフォーム", icon: "/images/nav/icon-reform.png", items: [] },
      { heading: "駆け付け対応", icon: "/images/nav/icon-repair.png", items: [] },
    ],
  },
  // 海外ビジネス was hidden on the legacy site (commented out) — kept hidden here for parity.
  { label: "海外ビジネス", href: "/immigration-planning", hidden: true },
  {
    label: "創業支援",
    href: "/entrepreneurship-support",
    banner: "/images/nav/banner-startup.png",
    brand: "/images/nav/brand-kyoboku.png",
    comingSoon: true,
    groups: [
      {
        heading: "起業家向け",
        icon: "/images/nav/icon-entrepreneur.png",
        items: [{ label: "経営コンサル" }],
      },
      {
        heading: "税務・労務",
        icon: "/images/nav/icon-tax.png",
        items: [{ label: "記帳代行" }, { label: "労務サポート" }],
      },
      {
        heading: "レンタルオフィス",
        icon: "/images/nav/icon-office.png",
        items: [{ label: "賃貸事務所" }],
      },
    ],
  },
  {
    label: "マンスリー",
    href: "/monthly-magazine",
    banner: "/images/nav/banner-monthly.png",
    brand: "/images/nav/brand-ark-nest.png",
    comingSoon: true,
    groups: [
      {
        heading: "マンスリーマンションの運営",
        icon: "/images/nav/icon-monthly.png",
        items: [],
      },
    ],
  },
  { label: "グループ情報", href: "/enterprise-intelligence" },
];

export const zhNavItems: NavItem[] = [
  { label: "首页", href: "/zh" },
  {
    label: "不动产买卖",
    href: "/zh/business-headquarters",
    banner: "/images/nav/banner-real-estate.png",
    brand: "/images/nav/brand-polaris-next.png",
    groups: [
      {
        heading: "不动产买卖·翻新转售",
        icon: "/images/nav/icon-buy-resell.jpg",
        items: [{ label: "二手房翻新" }, { label: "收益型不动产买卖" }],
      },
      {
        heading: "不动产中介",
        icon: "/images/nav/icon-brokerage.jpg",
        items: [
          { label: "收益型不动产投资企划" },
          { label: "住宅买卖中介" },
          { label: "租赁中介" },
        ],
      },
    ],
  },
  {
    label: "资产管理",
    href: "/zh/assets-management",
    banner: "/images/nav/banner-assets-management.jpg",
    brand: "/images/nav/brand-polaris-property.png",
    groups: [
      {
        heading: "租赁运营管理（PM）",
        icon: "/images/nav/icon-pm.png",
        items: [
          { label: "PM收支管理" },
          { label: "招商运营" },
          { label: "入住者・租户对应" },
          { label: "退租受理表单", href: "/zh/move-out-request", bold: true },
        ],
      },
      {
        heading: "建筑设施管理（BM）",
        icon: "/images/nav/icon-bm.png",
        items: [
          { label: "公共区域环境管理" },
          { label: "法定检查" },
          { label: "建筑设备维护" },
        ],
      },
    ],
  },
  {
    label: "室内装潢",
    href: "/zh/business-headquarters-2",
    banner: "/images/nav/banner-renovation.png",
    brand: "/images/nav/brand-polaris-next.png",
    groups: [
      { heading: "室内装潢", icon: "/images/nav/icon-renovation.png", items: [] },
      { heading: "翻新装修", icon: "/images/nav/icon-reform.png", items: [] },
      { heading: "上门维修对应", icon: "/images/nav/icon-repair.png", items: [] },
    ],
  },
  // 日本身份规划 (immigration-planning) is kept hidden here too, for parity with
  // the JA site where the equivalent 海外ビジネス item was intentionally hidden.
  { label: "日本身份规划", href: "/zh/immigration-planning", hidden: true },
  {
    label: "创业支援",
    href: "/zh/entrepreneurship-support",
    banner: "/images/nav/banner-startup.png",
    brand: "/images/nav/brand-kyoboku.png",
    comingSoon: true,
    groups: [
      {
        heading: "创业者支援",
        icon: "/images/nav/icon-entrepreneur.png",
        items: [{ label: "经营咨询" }],
      },
      {
        heading: "税务・劳务",
        icon: "/images/nav/icon-tax.png",
        items: [{ label: "记账代理" }, { label: "劳务支援" }],
      },
      {
        heading: "共享办公室",
        icon: "/images/nav/icon-office.png",
        items: [{ label: "租赁事务所" }],
      },
    ],
  },
  {
    label: "短租公寓",
    href: "/zh/monthly-magazine",
    banner: "/images/nav/banner-monthly.png",
    brand: "/images/nav/brand-ark-nest.png",
    comingSoon: true,
    groups: [
      {
        heading: "短租公寓运营",
        icon: "/images/nav/icon-monthly.png",
        items: [],
      },
    ],
  },
  { label: "集团介绍", href: "/zh/enterprise-intelligence" },
];
