import type { Metadata } from "next";
import RealEstatePageContent from "@/components/pages/RealEstatePageContent";

export const metadata: Metadata = {
  title: "不動産取引 | ポラリス・グループ",
};

export default function Page() {
  return <RealEstatePageContent />;
}
