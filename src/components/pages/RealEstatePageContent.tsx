import PageShell from "@/components/layout/PageShell";
import PageHero from "@/components/pages/PageHero";
import ServiceStrip from "@/components/pages/ServiceStrip";
import AdvantageList from "@/components/pages/AdvantageList";
import PhotoCoverflow from "@/components/pages/PhotoCoverflow";
import LatestNewsSection from "@/components/home/LatestNewsSection";
import { realEstate } from "@/data/pages/realEstate";
import { realEstateZh } from "@/data/pages/realEstate.zh";
import { getPageGallery } from "@/lib/pageGalleries";
import { getPageAdvantages } from "@/lib/pageAdvantages";

export default async function RealEstatePageContent({
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
  const [gallery, advantages] = await Promise.all([
    getPageGallery(pageKey),
    getPageAdvantages(pageKey, locale),
  ]);
  return (
    <PageShell locale={locale} subsidiary="next">
      <PageHero image={data.heroImage} title={data.heroTitle} />
      <ServiceStrip items={data.services} />
      <LatestNewsSection
        locale={locale}
        moreHref={locale === "zh" ? "/zh/news" : undefined}
        moreLabel={locale === "zh" ? "查看全部" : undefined}
      />
      <AdvantageList title={data.advantagesTitle} items={advantages} />
      <PhotoCoverflow title={galleryTitle} images={gallery} />
    </PageShell>
  );
}
