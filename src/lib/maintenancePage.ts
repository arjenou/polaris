import { comingSoonCopy } from "@/data/pages/comingSoon";
import type { ObjectPosition } from "@/lib/objectPosition";
import { DEFAULT_OBJECT_POSITION } from "@/lib/objectPosition";

const CMS_API_URL = process.env.CMS_API_URL ?? "https://polaris.api.yingmu-tech.com";

const REVALIDATE_SECONDS = 300;

const DEFAULT_IMAGE = comingSoonCopy.image;

export interface MaintenancePageData {
  image: string;
  objectPosition: ObjectPosition;
}

/** Background image for メンテナンス中 pages (マンスリー / 創業支援, ja/zh). */
export async function getMaintenancePageData(): Promise<MaintenancePageData> {
  try {
    const res = await fetch(`${CMS_API_URL}/api/maintenance-page`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      return { image: DEFAULT_IMAGE, objectPosition: DEFAULT_OBJECT_POSITION };
    }
    const data = await res.json();
    if (!data || typeof data.src !== "string") {
      return { image: DEFAULT_IMAGE, objectPosition: DEFAULT_OBJECT_POSITION };
    }
    return {
      image: data.src,
      objectPosition: data.objectPosition ?? DEFAULT_OBJECT_POSITION,
    };
  } catch {
    return { image: DEFAULT_IMAGE, objectPosition: DEFAULT_OBJECT_POSITION };
  }
}

/** @deprecated Use getMaintenancePageData */
export async function getMaintenancePageImage(): Promise<string> {
  const data = await getMaintenancePageData();
  return data.image;
}
