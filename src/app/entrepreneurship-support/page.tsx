import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import ComingSoon from "@/components/pages/ComingSoon";
import { comingSoonCopy } from "@/data/pages/comingSoon";
import { getMaintenancePageImage } from "@/lib/maintenancePage";

export const metadata: Metadata = {
  title: "創業支援 | ポラリス・グループ",
};

export default async function Page() {
  const image = await getMaintenancePageImage();

  return (
    <PageShell locale="ja" subsidiary="kyoboku">
      <ComingSoon image={image} body={comingSoonCopy.body} />
    </PageShell>
  );
}
