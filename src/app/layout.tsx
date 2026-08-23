import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Shippori_Mincho_B1 } from "next/font/google";
import FloatingContactButtons from "@/components/layout/FloatingContactButtons";
import { getContactQrImages } from "@/lib/contactQr";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

const shipporiMincho = Shippori_Mincho_B1({
  variable: "--font-shippori-mincho",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ポラリス・グループ | Polaris Group",
    template: "%s",
  },
  description:
    "ポラリス・グループは不動産取引・不動産管理・リノベーション・創業支援など幅広い事業を展開する総合企業グループです。",
  openGraph: {
    siteName: "ポラリス・グループ | Polaris Group",
    type: "website",
    locale: "ja_JP",
    alternateLocale: ["zh_CN"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const qrImages = await getContactQrImages();

  return (
    <html lang="ja" className={`${notoSansJP.variable} ${shipporiMincho.variable}`}>
      <body>
        {children}
        <FloatingContactButtons wechatImage={qrImages.wechat} lineImage={qrImages.line} />
      </body>
    </html>
  );
}
