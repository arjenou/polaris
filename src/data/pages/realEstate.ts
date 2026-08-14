// Shared content for /business-headquarters (不動産取引) and /business-headquarters-2
// (リノベーション) — both legacy pages render the same Polaris Next company content.
export const realEstate = {
  heroImage: "/images/pages/real-estate/banner.png",
  heroTitle: "ポラリス・ネクスト株式会社",
  services: [
    { title: "実需物件買取再販", image: "/images/pages/real-estate/service-1.png" },
    { title: "収益物件買取再販", image: "/images/pages/real-estate/service-2.png" },
    { title: "不動産仲介全般", image: "/images/pages/real-estate/service-3.png" },
    { title: "リノベーション", image: "/images/pages/real-estate/service-4.png" },
    { title: "リフォーム", image: "/images/pages/real-estate/service-5.png" },
  ],
  advantagesTitle: "私たちが選ばれる理由",
  // "私たちが選ばれる理由" items and gallery images are now managed via the CMS
  // admin (page-advantages / page-galleries), see src/lib/pageAdvantages.ts
  // and src/lib/pageGalleries.ts.
  galleryTitle: "不動産取引",
  renovationGalleryTitle: "工事内装",
};
