import type { Advantage } from "@/components/pages/AdvantageList";

/** The three fixed content pages whose bottom "私たちが選ばれる理由" section is
 * managed from the CMS. */
export type PageAdvantageKey = "real-estate" | "renovation" | "asset-management";

// Content is managed via the Polaris CMS (Cloudflare Pages + D1 + R2). See /cms.
const CMS_API_URL = process.env.CMS_API_URL ?? "https://polaris.api.yingmu-tech.com";

const REVALIDATE_SECONDS = 300;

interface PageAdvantageApiShape {
  id: number;
  badge: string;
  heading: string;
  body: string;
  image: string | null;
}

export async function getPageAdvantages(
  pageKey: PageAdvantageKey,
  locale: "ja" | "zh",
): Promise<(Advantage & { id: number })[]> {
  try {
    const res = await fetch(`${CMS_API_URL}/api/page-advantages?pageKey=${pageKey}&locale=${locale}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const items: PageAdvantageApiShape[] = await res.json();
    return items.map((item) => ({
      id: item.id,
      badge: item.badge,
      heading: item.heading,
      body: item.body,
      image: item.image ?? "",
    }));
  } catch {
    return [];
  }
}
