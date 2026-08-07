import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import NotFoundPage from "@/components/pages/NotFoundPage";

export const metadata: Metadata = {
  title: "页面未找到 | Polaris Group",
};

export default function NotFound() {
  return (
    <PageShell locale="zh">
      <NotFoundPage
        title="抱歉，页面未找到"
        body="您访问的链接可能有误，或页面已被删除/移动。请返回首页查找您需要的信息。"
        homeHref="/zh"
        homeLabel="返回首页"
      />
    </PageShell>
  );
}
