import type { CoverflowImage } from "@/components/pages/PhotoCoverflow";

/** The three fixed content pages whose bottom photo carousel is managed from
 * the CMS. Images are shared across ja/zh. */
export type PageGalleryKey = "real-estate" | "renovation" | "asset-management";

// Content is managed via the Polaris CMS (Cloudflare Pages + D1 + R2). See /cms.
const CMS_API_URL = process.env.CMS_API_URL ?? "https://polaris.api.yingmu-tech.com";

/** These galleries are revalidated periodically so edits made in the CMS
 * admin show up without a full redeploy of the Vercel site. */
const REVALIDATE_SECONDS = 300;

export async function getPageGallery(pageKey: PageGalleryKey): Promise<CoverflowImage[]> {
  try {
    const res = await fetch(`${CMS_API_URL}/api/page-galleries?pageKey=${pageKey}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
