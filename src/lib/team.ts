import type { PostLocale } from "./posts";

// Content is managed via the Polaris CMS (Cloudflare Pages + D1 + R2). See /cms.
// Unlike news/recommended, ja/zh team members are independent content.
// Homepage carousel order: president first (center), others randomized per visit.
const CMS_API_URL = process.env.CMS_API_URL ?? "https://polaris.api.yingmu-tech.com";

const REVALIDATE_SECONDS = 300;

export interface TeamMemberCard {
  id: number;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  department: string;
  position: string;
  description: string;
  tags: string[];
  languages: string[];
  image: string | null;
  imageWidth: number;
  imageHeight: number;
  isPresident: boolean;
}

export async function getTeamMembers(locale: PostLocale): Promise<TeamMemberCard[]> {
  try {
    const res = await fetch(`${CMS_API_URL}/api/team?locale=${locale}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
