import { Suspense } from "react";
import PageShell from "@/components/layout/PageShell";
import Hero from "@/components/home/Hero";
import LatestNewsSection from "@/components/home/LatestNewsSection";
import LatestRecommendedSection from "@/components/home/LatestRecommendedSection";
import TeamSection from "@/components/home/TeamSection";
import EventsSection from "@/components/home/EventsSection";
import NewsSectionSkeleton from "@/components/home/NewsSectionSkeleton";
import RecommendedSectionSkeleton from "@/components/home/RecommendedSectionSkeleton";
import TeamCarouselSkeleton from "@/components/home/TeamCarouselSkeleton";
import EventsCarouselSkeleton from "@/components/home/EventsCarouselSkeleton";
// GroupCompanies section is temporarily hidden on the homepage (kept for possible future re-enable).
// import GroupCompanies from "@/components/home/GroupCompanies";

export default function HomePage() {
  return (
    <PageShell locale="ja">
      <Hero />
      <Suspense fallback={<NewsSectionSkeleton />}>
        <LatestNewsSection locale="ja" />
      </Suspense>
      <Suspense fallback={<RecommendedSectionSkeleton />}>
        <LatestRecommendedSection locale="ja" />
      </Suspense>
      <Suspense fallback={<TeamCarouselSkeleton />}>
        <TeamSection locale="ja" />
      </Suspense>
      <Suspense fallback={<EventsCarouselSkeleton />}>
        <EventsSection locale="ja" />
      </Suspense>
      {/* <GroupCompanies /> */}
    </PageShell>
  );
}
