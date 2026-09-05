import Header from "./Header";
import Footer from "./Footer";
import type { SubsidiaryKey } from "@/data/subsidiaries";

export default function PageShell({
  children,
  locale = "ja",
  subsidiary,
}: {
  children: React.ReactNode;
  locale?: "ja" | "zh";
  subsidiary?: SubsidiaryKey;
}) {
  return (
    <>
      <Header locale={locale} />
      <main>{children}</main>
      <Footer subsidiary={subsidiary} />
    </>
  );
}
