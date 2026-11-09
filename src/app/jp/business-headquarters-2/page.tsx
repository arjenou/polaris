import type { Metadata } from "next";
import RealEstatePageContent from "@/components/pages/RealEstatePageContent";

export const metadata: Metadata = {
  title: "リノベーション | ポラリス・グループ",
};

export default function Page() {
  // The legacy site serves identical Polaris Next content on both the
  // 不動産取引 and リノベーション nav entries — replicated here intentionally.
  return <RealEstatePageContent variant="renovation" />;
}
