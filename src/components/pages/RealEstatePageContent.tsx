import { Suspense } from "react";
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
import { realEstate } from "@/data/pages/realEstate";
import { realEstateZh } from "@/data/pages/realEstate.zh";
import { getPageGallery } from "@/lib/pageGalleries";
import { getPageAdvantages } from "@/lib/pageAdvantages";
import { getPageMidImage } from "@/lib/pageMidImages";
import type { PageGalleryKey } from "@/lib/pageGalleries";

/** Fetches the CMS-managed advantages + gallery for this page and renders
 * them; isolated in its own async component so it can be wrapped in
 * <Suspense> without blocking the hero/service strip above it. */
async function RealEstateBottomSections({
  pageKey,
  locale,
  galleryTitle,
  advantagesTitle,
}: {
  pageKey: PageGalleryKey;
  locale: "ja" | "zh";
  galleryTitle: string;
  advantagesTitle: string;
}) {
  const [gallery, advantages, midImage] = await Promise.all([
    getPageGallery(pageKey),
    getPageAdvantages(pageKey, locale),
    getPageMidImage(pageKey),
  ]);
  return (
    <>
      <AdvantageList title={advantagesTitle} items={advantages} />
      <PageMidBanner image={midImage} />
      <PhotoCoverflow title={galleryTitle} images={gallery} />
    </>
  );
}

export default function RealEstatePageContent({
  locale = "ja",
  variant = "business",
}: {
  locale?: "ja" | "zh";
  variant?: "business" | "renovation";
}) {
  const data = locale === "zh" ? realEstateZh : realEstate;
  const galleryTitle =
    variant === "renovation" ? data.renovationGalleryTitle : data.galleryTitle;
  const pageKey = variant === "renovation" ? "renovation" : "real-estate";
  return (
    <PageShell locale={locale} subsidiary="next">
      <PageHero image={data.heroImage} title={data.heroTitle} />
      <ServiceStrip items={data.services} />
      <Suspense fallback={<NewsSectionSkeleton />}>
        <LatestNewsSection
          locale={locale}
          moreHref={locale === "zh" ? "/zh/news" : undefined}
          moreLabel={locale === "zh" ? "查看全部" : undefined}
        />
      </Suspense>
      <Suspense
        fallback={
          <>
            <AdvantageListSkeleton title={data.advantagesTitle} />
            <PhotoCoverflowSkeleton title={galleryTitle} />
          </>
        }
      >
        <RealEstateBottomSections
          pageKey={pageKey}
          locale={locale}
          galleryTitle={galleryTitle}
          advantagesTitle={data.advantagesTitle}
        />
      </Suspense>
    </PageShell>
  );
}
