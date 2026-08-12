import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import PageHero from "@/components/pages/PageHero";
import ServiceStrip from "@/components/pages/ServiceStrip";
import AdvantageList from "@/components/pages/AdvantageList";
import PhotoCoverflow from "@/components/pages/PhotoCoverflow";
import NewsSection from "@/components/home/NewsSection";
import { assetsManagement } from "@/data/pages/assetsManagement";

export const metadata: Metadata = {
  title: "不動産管理 | ポラリス・グループ",
};

export default function Page() {
  return (
    <PageShell locale="ja" subsidiary="property">
      <PageHero image={assetsManagement.heroImage} title={assetsManagement.heroTitle} />
      <ServiceStrip items={assetsManagement.services} />
      <NewsSection />
      <AdvantageList
        title={assetsManagement.advantagesTitle}
        items={assetsManagement.advantages}
      />
      <PhotoCoverflow title={assetsManagement.galleryTitle} images={assetsManagement.gallery} />
    </PageShell>
  );
}
