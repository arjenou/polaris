import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import ComingSoon from "@/components/pages/ComingSoon";
import { comingSoonCopyZh } from "@/data/pages/comingSoon.zh";
import { getMaintenancePageImage } from "@/lib/maintenancePage";

export const metadata: Metadata = {
  title: "创业支援 | Polaris Group",
};

export default async function Page() {
  const image = await getMaintenancePageImage();

  return (
    <PageShell locale="zh" subsidiary="kyoboku">
      <ComingSoon
        image={image}
        title={comingSoonCopyZh.title}
        body={comingSoonCopyZh.body}
      />
    </PageShell>
  );
}
