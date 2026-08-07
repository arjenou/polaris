import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import ComingSoon from "@/components/pages/ComingSoon";
import { comingSoonCopy } from "@/data/pages/comingSoon";

export const metadata: Metadata = {
  title: "マンスリー | ポラリス・グループ",
};

export default function Page() {
  return (
    <PageShell locale="ja">
      <ComingSoon image={comingSoonCopy.image} body={comingSoonCopy.body} />
    </PageShell>
  );
}
