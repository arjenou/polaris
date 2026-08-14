import type { Metadata } from "next";
import { Suspense } from "react";
import PageShell from "@/components/layout/PageShell";
import ContactForm from "@/components/contact/ContactForm";
import { contactCopyZh } from "@/data/contact";

export const metadata: Metadata = {
  title: "联系我们 | Polaris Group",
};

export default function Page() {
  return (
    <PageShell locale="zh">
      <Suspense fallback={null}>
        <ContactForm copy={contactCopyZh} homeHref="/zh" locale="zh" />
      </Suspense>
    </PageShell>
  );
}
