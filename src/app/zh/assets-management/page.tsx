import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import PageHero from "@/components/pages/PageHero";
import ServiceStrip from "@/components/pages/ServiceStrip";
import AdvantageList from "@/components/pages/AdvantageList";
import PhotoCoverflow from "@/components/pages/PhotoCoverflow";
import NewsSection from "@/components/home/NewsSection";
import { assetsManagementZh } from "@/data/pages/assetsManagement.zh";
import { newsItemsZh } from "@/data/home.zh";

export const metadata: Metadata = {
  title: "资产管理 | Polaris Group",
};

export default function Page() {
  return (
    <PageShell locale="zh" subsidiary="property">
      <PageHero image={assetsManagementZh.heroImage} title={assetsManagementZh.heroTitle} />
      <ServiceStrip items={assetsManagementZh.services} />
      <NewsSection items={newsItemsZh} />
      <AdvantageList
        title={assetsManagementZh.advantagesTitle}
        items={assetsManagementZh.advantages}
      />
      <PhotoCoverflow
        title={assetsManagementZh.galleryTitle}
        images={assetsManagementZh.gallery}
      />
    </PageShell>
  );
}
