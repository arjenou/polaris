import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import ComingSoon from "@/components/pages/ComingSoon";
import { comingSoonCopyZh } from "@/data/pages/comingSoon.zh";
import { getMaintenancePageImage } from "@/lib/maintenancePage";

export const metadata: Metadata = {
  title: "短租公寓 | Polaris Group",
};

export default async function Page() {
  const image = await getMaintenancePageImage();

  return (
    <PageShell locale="zh" subsidiary="arknest">
      <ComingSoon
        image={image}
        title={comingSoonCopyZh.title}
        body={comingSoonCopyZh.body}
      />
    </PageShell>
  );
}
