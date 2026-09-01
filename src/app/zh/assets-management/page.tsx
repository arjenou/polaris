import { Suspense } from "react";
import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import PageHero from "@/components/pages/PageHero";
import ServiceStrip from "@/components/pages/ServiceStrip";
import AdvantageList from "@/components/pages/AdvantageList";
import PageMidBanner from "@/components/pages/PageMidBanner";
import PhotoCoverflow from "@/components/pages/PhotoCoverflow";
import AdvantageListSkeleton from "@/components/pages/AdvantageListSkeleton";
import PhotoCoverflowSkeleton from "@/components/pages/PhotoCoverflowSkeleton";
import LatestNewsSection from "@/components/home/LatestNewsSection";
import NewsSectionSkeleton from "@/components/home/NewsSectionSkeleton";
import { assetsManagementZh } from "@/data/pages/assetsManagement.zh";
import { getPageGallery } from "@/lib/pageGalleries";
import { getPageAdvantages } from "@/lib/pageAdvantages";
import { getPageMidImage } from "@/lib/pageMidImages";

export const metadata: Metadata = {
  title: "资产管理 | Polaris Group",
};

async function BottomSections() {
  const [gallery, advantages, midImage] = await Promise.all([
    getPageGallery("asset-management"),
    getPageAdvantages("asset-management", "zh"),
    getPageMidImage("asset-management"),
  ]);
  return (
    <>
      <AdvantageList title={assetsManagementZh.advantagesTitle} items={advantages} />
      <PageMidBanner image={midImage} />
      <PhotoCoverflow title={assetsManagementZh.galleryTitle} images={gallery} />
    </>
  );
}

export default function Page() {
  return (
    <PageShell locale="zh" subsidiary="property">
      <PageHero image={assetsManagementZh.heroImage} title={assetsManagementZh.heroTitle} />
      <ServiceStrip items={assetsManagementZh.services} />
      <Suspense fallback={<NewsSectionSkeleton />}>
        <LatestNewsSection locale="zh" moreHref="/zh/news" moreLabel="查看全部" />
      </Suspense>
      <Suspense
        fallback={
          <>
            <AdvantageListSkeleton title={assetsManagementZh.advantagesTitle} />
            <PhotoCoverflowSkeleton title={assetsManagementZh.galleryTitle} />
          </>
        }
      >
        <BottomSections />
      </Suspense>
    </PageShell>
  );
}
