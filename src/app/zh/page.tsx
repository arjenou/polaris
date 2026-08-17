import { Suspense } from "react";
import type { Metadata } from "next";
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
import { heroHeadlineZh } from "@/data/home.zh";

export const metadata: Metadata = {
  title: "Polaris Group｜妙見川禾",
};

const teamLabelsZh = {
  eyebrow: "团队成员",
  title: "为您提供专业支持的团队成员介绍",
  detailBtn: "查看详情 ›",
  contactBtn: "联系该成员",
  introSectionTitle: "成员介绍",
  languageSectionTitle: "对应语言",
};

const eventsLabelsZh = {
  title: "社内活动",
  subtitle: "年会、团建等活动，为您展示Polaris集团的日常风采",
  more: "查看全部",
};

export default function ZhHomePage() {
  return (
    <PageShell locale="zh" subsidiary="shanghai">
      <Hero headline={heroHeadlineZh} />
      <Suspense fallback={<NewsSectionSkeleton />}>
        <LatestNewsSection locale="zh" moreHref="/zh/news" moreLabel="查看全部" />
      </Suspense>
      <Suspense fallback={<RecommendedSectionSkeleton />}>
        <LatestRecommendedSection
          locale="zh"
          eyebrow="推荐信息"
          title="精选最新案例与实用信息！"
          moreHref="/zh/recommended"
          moreLabel="查看全部"
        />
      </Suspense>
      <Suspense fallback={<TeamCarouselSkeleton />}>
        <TeamSection locale="zh" labels={teamLabelsZh} />
      </Suspense>
      <Suspense fallback={<EventsCarouselSkeleton />}>
        <EventsSection locale="zh" labels={eventsLabelsZh} />
      </Suspense>
      {/* <GroupCompanies
        eyebrow="集团企业"
        title="欢迎了解Polaris集团旗下各企业官网！"
        domesticTitle="日本企业"
        overseasTitle="海外企业"
        domestic={domesticCompaniesZh}
        overseas={overseasCompaniesZh}
      /> */}
    </PageShell>
  );
}
