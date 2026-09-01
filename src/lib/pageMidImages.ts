import type { PageGalleryKey } from "@/lib/pageGalleries";

export interface PageMidImage {
  src: string;
  width: number;
  height: number;
}

// Content is managed via the Polaris CMS. See /cms.
const CMS_API_URL = process.env.CMS_API_URL ?? "https://polaris.api.yingmu-tech.com";

const REVALIDATE_SECONDS = 300;

/** Optional banner between advantages and the bottom gallery on subsidiary pages. */
export async function getPageMidImage(pageKey: PageGalleryKey): Promise<PageMidImage | null> {
  try {
    const res = await fetch(`${CMS_API_URL}/api/page-mid-images?pageKey=${pageKey}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data.src !== "string") return null;
    return data as PageMidImage;
  } catch {
    return null;
  }
}
