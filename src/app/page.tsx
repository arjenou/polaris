import PageShell from "@/components/layout/PageShell";
import Hero from "@/components/home/Hero";
import LatestNewsSection from "@/components/home/LatestNewsSection";
import RecommendedSection from "@/components/home/RecommendedSection";
import TeamCarousel from "@/components/home/TeamCarousel";
import EventsCarousel from "@/components/home/EventsCarousel";
// GroupCompanies section is temporarily hidden on the homepage (kept for possible future re-enable).
// import GroupCompanies from "@/components/home/GroupCompanies";

export default function HomePage() {
  return (
    <PageShell locale="ja">
      <Hero />
      <LatestNewsSection locale="ja" />
      <RecommendedSection />
      <TeamCarousel />
      <EventsCarousel />
      {/* <GroupCompanies /> */}
    </PageShell>
  );
}
