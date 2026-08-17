import type { Metadata } from "next";
import { Suspense } from "react";
import PageShell from "@/components/layout/PageShell";
import ContactForm from "@/components/contact/ContactForm";
import { contactCopyJa } from "@/data/contact";
import { getContactQrImages } from "@/lib/contactQr";

export const metadata: Metadata = {
  title: "お問い合わせ | ポラリス・グループ",
};

export default async function Page() {
  const qrImages = await getContactQrImages();
  return (
    <PageShell locale="ja">
      <Suspense fallback={null}>
        <ContactForm copy={contactCopyJa} homeHref="/" locale="ja" qrImages={qrImages} />
      </Suspense>
    </PageShell>
  );
}
