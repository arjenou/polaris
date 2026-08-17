// Content is managed via the Polaris CMS (Cloudflare Pages + D1 + R2). See /cms.
const CMS_API_URL = process.env.CMS_API_URL ?? "https://polaris.api.yingmu-tech.com";

const REVALIDATE_SECONDS = 300;

export interface ContactQrImages {
  wechat: string | null;
  line: string | null;
}

interface ContactQrApiShape {
  imageUrl: string | null;
}

/** Fetches the WeChat / Line QR code image URLs shown on the お問い合わせ
 * (Contact) page, managed from the CMS. Falls back to `null` (the frontend
 * shows a "coming soon" placeholder) when unset or unreachable. */
export async function getContactQrImages(): Promise<ContactQrImages> {
  try {
    const res = await fetch(`${CMS_API_URL}/api/contact-qr`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return { wechat: null, line: null };
    const data: { wechat: ContactQrApiShape | null; line: ContactQrApiShape | null } = await res.json();
    return {
      wechat: data.wechat?.imageUrl ?? null,
      line: data.line?.imageUrl ?? null,
    };
  } catch {
    return { wechat: null, line: null };
  }
}
