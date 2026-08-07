import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import ContactForm from "@/components/contact/ContactForm";
import { contactCopyZh } from "@/data/contact";

export const metadata: Metadata = {
  title: "联系我们 | Polaris Group",
};

export default function Page() {
  return (
    <PageShell locale="zh">
      <ContactForm copy={contactCopyZh} homeHref="/zh" />
    </PageShell>
  );
}
