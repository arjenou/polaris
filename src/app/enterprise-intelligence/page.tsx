import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import PageHero from "@/components/pages/PageHero";
import GroupInfoIntro from "@/components/pages/GroupInfoIntro";
import CompanyTimeline from "@/components/pages/CompanyTimeline";
import CompanyCards from "@/components/pages/CompanyCards";
import { groupInfo } from "@/data/pages/groupInfo";
import { getGroupCompanies } from "@/lib/groupCompanies";

export const metadata: Metadata = {
  title: "グループ情報 | ポラリス・グループ",
};

export default async function Page() {
  const { domestic, overseas } = await getGroupCompanies("ja");
  return (
    <PageShell locale="ja">
      <PageHero image={groupInfo.heroImage} title={groupInfo.heroTitle} />
      <GroupInfoIntro
        badge={groupInfo.badge}
        title={groupInfo.introTitle}
        paragraphs={groupInfo.intro}
      />
      <CompanyTimeline title={groupInfo.timelineTitle} items={groupInfo.timeline} />
      <CompanyCards
        companiesTitle={groupInfo.companiesTitle}
        domesticTitle={groupInfo.domesticTitle}
        overseasTitle={groupInfo.overseasTitle}
        domestic={domestic}
        overseas={overseas}
      />
    </PageShell>
  );
}
