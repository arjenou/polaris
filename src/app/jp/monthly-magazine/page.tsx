import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import ComingSoon from "@/components/pages/ComingSoon";
import { comingSoonCopy } from "@/data/pages/comingSoon";
import { getMaintenancePageData } from "@/lib/maintenancePage";

export const metadata: Metadata = {
  title: "マンスリー | ポラリス・グループ",
};

export default async function Page() {
  const { image, objectPosition } = await getMaintenancePageData();

  return (
    <PageShell locale="ja" subsidiary="arknest">
      <ComingSoon image={image} objectPosition={objectPosition} body={comingSoonCopy.body} />
    </PageShell>
  );
}
