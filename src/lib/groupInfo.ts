import { groupInfo as defaultGroupInfoJa } from "@/data/pages/groupInfo";
import { groupInfoZh as defaultGroupInfoZh } from "@/data/pages/groupInfo.zh";
import type { TimelineEntry } from "@/components/pages/CompanyTimeline";

// Content is managed via the Polaris CMS (Cloudflare Pages + D1 + R2). See /cms.
const CMS_API_URL = process.env.CMS_API_URL ?? "https://polaris.api.yingmu-tech.com";

const REVALIDATE_SECONDS = 300;

export interface GroupInfoData {
  heroImage: string;
  heroTitle: string;
  badge: string;
  introTitle: string;
  intro: string[];
  timelineTitle: string;
  timeline: TimelineEntry[];
  companiesTitle: string;
  domesticTitle: string;
  overseasTitle: string;
}

interface GroupInfoApiShape {
  heroTitle?: string;
  heroImage?: string | null;
  badge?: string | null;
  introTitle?: string;
  intro?: string[];
  timelineTitle?: string;
  timeline?: TimelineEntry[];
  companiesTitle?: string;
  domesticTitle?: string;
  overseasTitle?: string;
}

/** Falls back to the hardcoded defaults if the CMS is unreachable or has no
 * data yet, so the page never breaks. */
export async function getGroupInfo(locale: "ja" | "zh"): Promise<GroupInfoData> {
  const fallback = locale === "zh" ? defaultGroupInfoZh : defaultGroupInfoJa;

  try {
    const res = await fetch(`${CMS_API_URL}/api/group-info?locale=${locale}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return fallback;

    const data: GroupInfoApiShape = await res.json();

    return {
      heroImage: data.heroImage || fallback.heroImage,
      heroTitle: data.heroTitle?.trim() ? data.heroTitle : fallback.heroTitle,
      badge: data.badge || fallback.badge,
      introTitle: data.introTitle?.trim() ? data.introTitle : fallback.introTitle,
      intro: Array.isArray(data.intro) && data.intro.length > 0 ? data.intro : fallback.intro,
      timelineTitle: data.timelineTitle?.trim() ? data.timelineTitle : fallback.timelineTitle,
      timeline: Array.isArray(data.timeline) && data.timeline.length > 0 ? data.timeline : fallback.timeline,
      companiesTitle: data.companiesTitle?.trim() ? data.companiesTitle : fallback.companiesTitle,
      domesticTitle: data.domesticTitle?.trim() ? data.domesticTitle : fallback.domesticTitle,
      overseasTitle: data.overseasTitle?.trim() ? data.overseasTitle : fallback.overseasTitle,
    };
  } catch {
    return fallback;
  }
}
