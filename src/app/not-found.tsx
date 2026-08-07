import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import NotFoundPage from "@/components/pages/NotFoundPage";

export const metadata: Metadata = {
  title: "ページが見つかりません | ポラリス・グループ",
};

export default function NotFound() {
  return (
    <PageShell locale="ja">
      <NotFoundPage
        title="お探しのページが見つかりません"
        body="URLが間違っているか、ページが削除・移動された可能性があります。お手数ですが、トップページからお探しの情報をご確認ください。"
        homeHref="/"
        homeLabel="トップページへ戻る"
      />
    </PageShell>
  );
}
