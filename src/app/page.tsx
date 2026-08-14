import PageShell from "@/components/layout/PageShell";
import Hero from "@/components/home/Hero";
import LatestNewsSection from "@/components/home/LatestNewsSection";
import LatestRecommendedSection from "@/components/home/LatestRecommendedSection";
import TeamCarousel from "@/components/home/TeamCarousel";
import EventsCarousel from "@/components/home/EventsCarousel";
// GroupCompanies section is temporarily hidden on the homepage (kept for possible future re-enable).
// import GroupCompanies from "@/components/home/GroupCompanies";

export default function HomePage() {
  return (
    <PageShell locale="ja">
      <Hero />
      <LatestNewsSection locale="ja" />
      <LatestRecommendedSection locale="ja" />
      <TeamCarousel />
      <EventsCarousel />
      {/* <GroupCompanies /> */}
    </PageShell>
  );
}
