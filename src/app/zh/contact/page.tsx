import type { Metadata } from "next";
import { Suspense } from "react";
import PageShell from "@/components/layout/PageShell";
import ContactForm from "@/components/contact/ContactForm";
import { contactCopyZh } from "@/data/contact";
import { getContactQrImages } from "@/lib/contactQr";

export const metadata: Metadata = {
  title: "联系我们 | Polaris Group",
};

export default async function Page() {
  const qrImages = await getContactQrImages();
  return (
    <PageShell locale="zh">
      <Suspense fallback={null}>
        <ContactForm copy={contactCopyZh} homeHref="/zh" locale="zh" qrImages={qrImages} />
      </Suspense>
    </PageShell>
  );
}
