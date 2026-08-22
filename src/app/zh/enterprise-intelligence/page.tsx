import { Suspense } from "react";
import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import PageHero from "@/components/pages/PageHero";
import GroupInfoIntro from "@/components/pages/GroupInfoIntro";
import CompanyTimeline from "@/components/pages/CompanyTimeline";
import CompanyCards from "@/components/pages/CompanyCards";
import CompanyCardsSkeleton from "@/components/pages/CompanyCardsSkeleton";
import { getGroupInfo } from "@/lib/groupInfo";
import { getGroupCompanies } from "@/lib/groupCompanies";

export const metadata: Metadata = {
  title: "集团介绍 | Polaris Group",
};

async function GroupCompanyCards({
  companiesTitle,
  domesticTitle,
  overseasTitle,
}: {
  companiesTitle: string;
  domesticTitle: string;
  overseasTitle: string;
}) {
  const { domestic, overseas } = await getGroupCompanies("zh");
  return (
    <CompanyCards
      locale="zh"
      companiesTitle={companiesTitle}
      domesticTitle={domesticTitle}
      overseasTitle={overseasTitle}
      domestic={domestic}
      overseas={overseas}
    />
  );
}

export default async function Page() {
  const groupInfoZh = await getGroupInfo("zh");

  return (
    <PageShell locale="zh">
      <PageHero image={groupInfoZh.heroImage} title={groupInfoZh.heroTitle} />
      <GroupInfoIntro
        badge={groupInfoZh.badge}
        title={groupInfoZh.introTitle}
        paragraphs={groupInfoZh.intro}
      />
      <CompanyTimeline title={groupInfoZh.timelineTitle} items={groupInfoZh.timeline} />
      <Suspense
        fallback={
          <CompanyCardsSkeleton
            companiesTitle={groupInfoZh.companiesTitle}
            domesticTitle={groupInfoZh.domesticTitle}
            overseasTitle={groupInfoZh.overseasTitle}
          />
        }
      >
        <GroupCompanyCards
          companiesTitle={groupInfoZh.companiesTitle}
          domesticTitle={groupInfoZh.domesticTitle}
          overseasTitle={groupInfoZh.overseasTitle}
        />
      </Suspense>
    </PageShell>
  );
}
