import PageShell from "@/components/layout/PageShell";
import PageHero from "@/components/pages/PageHero";
import ServiceStrip from "@/components/pages/ServiceStrip";
import AdvantageList from "@/components/pages/AdvantageList";
import PhotoCoverflow from "@/components/pages/PhotoCoverflow";
import NewsSection from "@/components/home/NewsSection";
import { realEstate } from "@/data/pages/realEstate";
import { realEstateZh } from "@/data/pages/realEstate.zh";
import { newsItemsZh } from "@/data/home.zh";

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
  return (
    <PageShell locale={locale}>
      <PageHero image={data.heroImage} title={data.heroTitle} />
      <ServiceStrip items={data.services} />
      <NewsSection items={locale === "zh" ? newsItemsZh : undefined} />
      <AdvantageList title={data.advantagesTitle} items={data.advantages} />
      <PhotoCoverflow title={galleryTitle} images={data.gallery} />
    </PageShell>
  );
}
