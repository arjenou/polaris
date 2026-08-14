import PageShell from "@/components/layout/PageShell";
import Hero from "@/components/home/Hero";
import LatestNewsSection from "@/components/home/LatestNewsSection";
import LatestRecommendedSection from "@/components/home/LatestRecommendedSection";
import TeamSection from "@/components/home/TeamSection";
import EventsSection from "@/components/home/EventsSection";
// GroupCompanies section is temporarily hidden on the homepage (kept for possible future re-enable).
// import GroupCompanies from "@/components/home/GroupCompanies";

export default function HomePage() {
  return (
    <PageShell locale="ja">
      <Hero />
      <LatestNewsSection locale="ja" />
      <LatestRecommendedSection locale="ja" />
      <TeamSection locale="ja" />
      <EventsSection locale="ja" />
      {/* <GroupCompanies /> */}
    </PageShell>
  );
}
