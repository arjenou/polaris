import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import Hero from "@/components/home/Hero";
import NewsSection from "@/components/home/NewsSection";
import RecommendedSection from "@/components/home/RecommendedSection";
import TeamCarousel from "@/components/home/TeamCarousel";
import EventsCarousel from "@/components/home/EventsCarousel";
// GroupCompanies section is temporarily hidden on the homepage (kept for possible future re-enable).
// import GroupCompanies from "@/components/home/GroupCompanies";
import {
  heroHeadlineZh,
  newsItemsZh,
  recommendedItemsZh,
} from "@/data/home.zh";
import { companyEventsZh } from "@/data/events.zh";

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
  subtitle:
    "年会、团建等活动，为您展示Polaris集团的日常风采（照片・日程为示例内容）",
};

export default function ZhHomePage() {
  return (
    <PageShell locale="zh">
      <Hero headline={heroHeadlineZh} />
      <NewsSection items={newsItemsZh} moreHref="/zh/news" moreLabel="查看全部" />
      <RecommendedSection
        eyebrow="推荐信息"
        title="精选最新案例与实用信息！"
        items={recommendedItemsZh}
      />
      <TeamCarousel labels={teamLabelsZh} />
      <EventsCarousel labels={eventsLabelsZh} events={companyEventsZh} basePath="/zh/events" />
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
