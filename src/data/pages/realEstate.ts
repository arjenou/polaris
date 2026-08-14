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
  advantages: [
    {
      badge: "ADVANTAGE 1",
      heading: "誇りある実績",
      body: "実需物件でも収益物件でも、豊富な実績と専門知識に基づき、最適な不動産取引をサポートいたします。2024年間売買実績は100件超、賃貸仲介件数は400件以上。確かな実績が私たちの強みです。宅建士および司法書士が全行程を厳格に管理し、安心・安全な取引を徹底しています。物件選定から契約・引き渡しまで、ワンストップで丁寧にサポートし、安心してご購入・ご投資いただけます。",
      image: "/images/pages/real-estate/advantage-1.png",
    },
    {
      badge: "ADVANTAGE 2",
      heading: "実績で信頼を獲得",
      body: "2024年、内装事業部は売上高1億円の突破を目前に控え、【株式会社アイダ設計】および【株式会社オーペンハウス】の2社上場企業と戦略的パートナーシップを締結しました。当社は上場企業の基準を自らに課し、施工・品質・サービスの細部に至るまで徹底した管理を行い、高品質・高効率・高満足のプロジェクト成果を実現しています。今後も専門性をさらに磨き、より高い基準でお客様に貢献し、頼される空間ソリューションパートナーを目指してまいります。",
      image: "/images/pages/real-estate/advantage-2.png",
    },
    {
      badge: "ADVANTAGE 3",
      heading: "業界からの評価",
      body: "不動産分野で7年にわたり実績を積み重ね、これまでに数千件を超える取引を通じて、確かな経験と専門性を培ってまいりました。お客様一人ひとりに最適な不動産ソリューションをご提供できる体制を整えています。また、グループ内の複数企業が連携し、情報の透明性、迅速な対応、安心感のあるサービスを強みに、業界内外から高い評価と厚い信頼をいただいています。",
      image: "/images/pages/real-estate/advantage-3.png",
    },
  ],
  galleryTitle: "不動産取引",
  renovationGalleryTitle: "工事内装",
  // Gallery images are now managed via the CMS admin (page-galleries), see
  // src/lib/pageGalleries.ts.
};
