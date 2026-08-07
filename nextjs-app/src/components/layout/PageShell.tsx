import Header from "./Header";
import Footer from "./Footer";

export default function PageShell({
  children,
  locale = "ja",
}: {
  children: React.ReactNode;
  locale?: "ja" | "zh";
}) {
  return (
    <>
      <Header locale={locale} />
      <main>{children}</main>
      <Footer locale={locale} />
    </>
  );
}
