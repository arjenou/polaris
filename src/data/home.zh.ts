import type { GroupCompanyCard, NewsItem, RecommendedItem } from "./home";

export const heroHeadlineZh = "跨域筑新，启径拓远";

export const newsItemsZh: NewsItem[] = [
  { date: "2025.08.09", tag: "通知", title: "夏休休业通知", href: "/news/obon-2025" },
  {
    date: "2025.05.13",
    tag: "通知",
    title: "短租公寓项目火热招商中",
    href: "/news/monthly-mansion-expansion",
  },
];

export const recommendedItemsZh: RecommendedItem[] = [
  {
    tag: "不动产买卖·中介",
    title: "商标注册公告",
    excerpt: "各位客户、合作方及业界相关人士……",
    image: "/images/home/recommend-1.png",
    href: "/news/trademark-notice",
  },
  {
    tag: "其他",
    title: "Polaris集团招聘信息",
    excerpt: "Polaris集团正随着业务的快速扩张……",
    image: "/images/home/recommend-2.png",
    href: "/news/careers",
  },
  {
    tag: "创业支援",
    title: "港区｜自有共享办公室火热招租中",
    excerpt: "港区位于东京中心地带，是高端商务区……",
    image: "/images/home/recommend-3.png",
    href: "/news/minato-office",
  },
];

export const domesticCompaniesZh: GroupCompanyCard[] = [
  {
    title: "投资及自住不动产买卖・全方位不动产中介",
    image: "/images/home/group-nexus.png",
    href: "/zh/business-headquarters",
  },
  {
    title: "资产管理・收益资产管理（PM）・建筑设备管理（BM）",
    image: "/images/home/group-property.png",
    href: "/zh/assets-management",
  },
  {
    title: "短租公寓运营",
    image: "/images/home/group-arknest.png",
    comingSoon: true,
  },
  {
    title: "民宿・旅馆・酒店客房清扫服务・建筑物公共区域清扫服务",
    image: "/images/home/group-kawara.png",
    comingSoon: true,
  },
  {
    title: "为创业者提供全方位创业经营支持・共享办公室的运营",
    image: "/images/home/group-takagi.png",
    comingSoon: true,
  },
  {
    title: "全方位行政书士业务",
    image: "/images/home/group-myoken.png",
    comingSoon: true,
  },
];

export const overseasCompaniesZh: GroupCompanyCard[] = [
  {
    title: "移民规划・赴日投资策划・海外商务拓展服务",
    image: "/images/home/group-shanghai.png",
    comingSoon: true,
  },
];
