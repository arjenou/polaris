import type { Metadata } from "next";
import RealEstatePageContent from "@/components/pages/RealEstatePageContent";

export const metadata: Metadata = {
  title: "室内装潢 | Polaris Group",
};

export default function Page() {
  // Mirrors the JA site: 室内装潢 renders the same Polaris Next content as 不动产买卖.
  return <RealEstatePageContent locale="zh" variant="renovation" />;
}
