import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import MoveOutForm from "@/components/moveOut/MoveOutForm";
import { moveOutFormCopyJa } from "@/data/moveOutForm";

export const metadata: Metadata = {
  title: "退去受付フォーム | ポラリス・グループ",
};

export default function Page() {
  return (
    <PageShell locale="ja">
      <MoveOutForm copy={moveOutFormCopyJa} backHref="/assets-management" homeHref="/" />
    </PageShell>
  );
}
