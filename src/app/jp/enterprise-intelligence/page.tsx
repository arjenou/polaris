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
  title: "グループ情報 | ポラリス・グループ",
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
  const { domestic, overseas } = await getGroupCompanies("ja");
  return (
    <CompanyCards
      locale="ja"
      companiesTitle={companiesTitle}
      domesticTitle={domesticTitle}
      overseasTitle={overseasTitle}
      domestic={domestic}
      overseas={overseas}
    />
  );
}

export default async function Page() {
  const groupInfo = await getGroupInfo("ja");

  return (
    <PageShell locale="ja">
      <PageHero
        image={groupInfo.heroImage}
        title={groupInfo.heroTitle}
        objectPosition={groupInfo.heroObjectPosition}
      />
      <GroupInfoIntro
        badge={groupInfo.badge}
        title={groupInfo.introTitle}
        paragraphs={groupInfo.intro}
      />
      <CompanyTimeline title={groupInfo.timelineTitle} items={groupInfo.timeline} />
      <Suspense
        fallback={
          <CompanyCardsSkeleton
            companiesTitle={groupInfo.companiesTitle}
            domesticTitle={groupInfo.domesticTitle}
            overseasTitle={groupInfo.overseasTitle}
          />
        }
      >
        <GroupCompanyCards
          companiesTitle={groupInfo.companiesTitle}
          domesticTitle={groupInfo.domesticTitle}
          overseasTitle={groupInfo.overseasTitle}
        />
      </Suspense>
    </PageShell>
  );
}
