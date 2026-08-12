import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import MoveOutForm from "@/components/moveOut/MoveOutForm";
import { moveOutFormCopyZh } from "@/data/moveOutForm";

export const metadata: Metadata = {
  title: "退租受理表单 | Polaris Group",
};

export default function Page() {
  return (
    <PageShell locale="zh">
      <MoveOutForm copy={moveOutFormCopyZh} backHref="/zh/assets-management" homeHref="/zh" />
    </PageShell>
  );
}
