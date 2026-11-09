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
import { assetsManagement } from "@/data/pages/assetsManagement";
import { getPageGallery } from "@/lib/pageGalleries";
import { getPageAdvantages } from "@/lib/pageAdvantages";
import { getPageMidImage } from "@/lib/pageMidImages";

export const metadata: Metadata = {
  title: "不動産管理 | ポラリス・グループ",
};

async function BottomSections() {
  const [gallery, advantages, midImage] = await Promise.all([
    getPageGallery("asset-management"),
    getPageAdvantages("asset-management", "ja"),
    getPageMidImage("asset-management"),
  ]);
  return (
    <>
      <AdvantageList title={assetsManagement.advantagesTitle} items={advantages} />
      <PageMidBanner image={midImage} />
      <PhotoCoverflow title={assetsManagement.galleryTitle} images={gallery} />
    </>
  );
}

export default function Page() {
  return (
    <PageShell locale="ja" subsidiary="property">
      <PageHero image={assetsManagement.heroImage} title={assetsManagement.heroTitle} />
      <ServiceStrip items={assetsManagement.services} />
      <Suspense fallback={<NewsSectionSkeleton />}>
        <LatestNewsSection locale="ja" />
      </Suspense>
      <Suspense
        fallback={
          <>
            <AdvantageListSkeleton title={assetsManagement.advantagesTitle} />
            <PhotoCoverflowSkeleton title={assetsManagement.galleryTitle} />
          </>
        }
      >
        <BottomSections />
      </Suspense>
    </PageShell>
  );
}
