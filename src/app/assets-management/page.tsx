import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import PageHero from "@/components/pages/PageHero";
import ServiceStrip from "@/components/pages/ServiceStrip";
import AdvantageList from "@/components/pages/AdvantageList";
import PhotoCoverflow from "@/components/pages/PhotoCoverflow";
import LatestNewsSection from "@/components/home/LatestNewsSection";
import { assetsManagement } from "@/data/pages/assetsManagement";
import { getPageGallery } from "@/lib/pageGalleries";
import { getPageAdvantages } from "@/lib/pageAdvantages";

export const metadata: Metadata = {
  title: "不動産管理 | ポラリス・グループ",
};

export default async function Page() {
  const [gallery, advantages] = await Promise.all([
    getPageGallery("asset-management"),
    getPageAdvantages("asset-management", "ja"),
  ]);
  return (
    <PageShell locale="ja" subsidiary="property">
      <PageHero image={assetsManagement.heroImage} title={assetsManagement.heroTitle} />
      <ServiceStrip items={assetsManagement.services} />
      <LatestNewsSection locale="ja" />
      <AdvantageList title={assetsManagement.advantagesTitle} items={advantages} />
      <PhotoCoverflow title={assetsManagement.galleryTitle} images={gallery} />
    </PageShell>
  );
}
