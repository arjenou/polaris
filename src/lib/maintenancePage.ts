import { comingSoonCopy } from "@/data/pages/comingSoon";

const CMS_API_URL = process.env.CMS_API_URL ?? "https://polaris.api.yingmu-tech.com";

const REVALIDATE_SECONDS = 300;

const DEFAULT_IMAGE = comingSoonCopy.image;

/** Background image for メンテナンス中 pages (マンスリー / 創業支援, ja/zh). */
export async function getMaintenancePageImage(): Promise<string> {
  try {
    const res = await fetch(`${CMS_API_URL}/api/maintenance-page`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return DEFAULT_IMAGE;
    const data = await res.json();
    if (!data || typeof data.src !== "string") return DEFAULT_IMAGE;
    return data.src;
  } catch {
    return DEFAULT_IMAGE;
  }
}
