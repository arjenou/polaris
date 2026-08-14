// Shared content for /zh/business-headquarters (不动产买卖) and
// /zh/business-headquarters-2 (室内装潢) — both legacy pages render identical content.
export const realEstateZh = {
  heroImage: "/images/pages/real-estate/banner.png",
  heroTitle: "Polaris Next 株式会社",
  services: [
    { title: "住房买卖中介", image: "/images/pages/real-estate/service-1.png" },
    { title: "收益不动产买卖", image: "/images/pages/real-estate/service-2.png" },
    { title: "不动产中介", image: "/images/pages/real-estate/service-3.png" },
    { title: "室内装潢", image: "/images/pages/real-estate/service-4.png" },
    { title: "室内改修", image: "/images/pages/real-estate/service-5.png" },
  ],
  advantagesTitle: "我们备受选择的理由",
  advantages: [
    {
      badge: "ADVANTAGE 1",
      heading: "2024年成果",
      body: "无论自住购房还是投资置业，我们都拥有丰富实绩与专业经验。2024年成交买卖案件逾100件，租赁中介案件超过400件，实力有据。全程由宅建士与司法书士严格把关，确保交易正规、安全、无忧。从房源甄选到签约交付，提供一站式全流程支持，助您轻松实现购房与投资目标。",
      image: "/images/pages/real-estate/advantage-1.png",
    },
    {
      badge: "ADVANTAGE 2",
      heading: "以实力赢信赖",
      body: "2024年，内装事业部营业额近1亿日元，并与【株式会社アイダ設計】、【株式会社オーペンハウス】两家上市企业达成战略合作。我们以上市企业标准严格自律，精细把控施工、品质与服务细节，致力于打造高品质、高效率、高满意度的项目成果。未来将持续深耕专业，以更高标准服务客户，成为值得信赖的空间解决方案伙伴。",
      image: "/images/pages/real-estate/advantage-2.png",
    },
    {
      badge: "ADVANTAGE 3",
      heading: "业界的高度评价",
      body: "不动产领域七年深耕，凭借数以千计的不动产交易实绩，积累了扎实的经验与专业能力，为每一位客户量身定制最优解决方案。此外，得益于集团内部多企业的协作机制，以及在信息透明、响应迅速、服务安心等方面的卓越表现，我们赢得了业界与客户的高度评价与深厚信赖。",
      image: "/images/pages/real-estate/advantage-3.png",
    },
  ],
  galleryTitle: "不动产买卖",
  renovationGalleryTitle: "室内装潢",
  // Gallery images are now managed via the CMS admin (page-galleries), see
  // src/lib/pageGalleries.ts.
};
