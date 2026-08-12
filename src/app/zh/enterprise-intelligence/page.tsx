import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import PageHero from "@/components/pages/PageHero";
import GroupInfoIntro from "@/components/pages/GroupInfoIntro";
import CompanyTimeline from "@/components/pages/CompanyTimeline";
import CompanyCards from "@/components/pages/CompanyCards";
import { groupInfoZh } from "@/data/pages/groupInfo.zh";

export const metadata: Metadata = {
  title: "集团介绍 | Polaris Group",
};

export default function Page() {
  return (
    <PageShell locale="zh">
      <PageHero image={groupInfoZh.heroImage} title={groupInfoZh.heroTitle} />
      <GroupInfoIntro
        badge={groupInfoZh.badge}
        title={groupInfoZh.introTitle}
        paragraphs={groupInfoZh.intro}
      />
      <CompanyTimeline title={groupInfoZh.timelineTitle} items={groupInfoZh.timeline} />
      <CompanyCards
        companiesTitle={groupInfoZh.companiesTitle}
        domesticTitle={groupInfoZh.domesticTitle}
        overseasTitle={groupInfoZh.overseasTitle}
        domestic={groupInfoZh.domestic}
        overseas={groupInfoZh.overseas}
      />
    </PageShell>
  );
}
