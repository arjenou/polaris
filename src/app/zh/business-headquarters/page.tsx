import type { Metadata } from "next";
import RealEstatePageContent from "@/components/pages/RealEstatePageContent";

export const metadata: Metadata = {
  title: "不动产买卖 | Polaris Group",
};

export default function Page() {
  return <RealEstatePageContent locale="zh" />;
}
