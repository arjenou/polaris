import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import ComingSoon from "@/components/pages/ComingSoon";
import { comingSoonCopyZh } from "@/data/pages/comingSoon.zh";

export const metadata: Metadata = {
  title: "短租公寓 | Polaris Group",
};

export default function Page() {
  return (
    <PageShell locale="zh" subsidiary="arknest">
      <ComingSoon
        image={comingSoonCopyZh.image}
        title={comingSoonCopyZh.title}
        body={comingSoonCopyZh.body}
      />
    </PageShell>
  );
}
