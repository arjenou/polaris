import Header from "./Header";
import Footer from "./Footer";
import type { SubsidiaryKey } from "@/data/subsidiaries";

export default function PageShell({
  children,
  locale = "ja",
  subsidiary,
  alternateHref,
}: {
  children: React.ReactNode;
  locale?: "ja" | "zh";
  subsidiary?: SubsidiaryKey;
  /** Exact URL of this page in the other locale, for pages (CMS articles)
   * whose counterpart can't be derived by toggling the /zh prefix. */
  alternateHref?: string;
}) {
  return (
    <>
      <Header locale={locale} alternateHref={alternateHref} />
      <main>{children}</main>
      <Footer subsidiary={subsidiary} />
    </>
  );
}
