import { heroHeadline as defaultHeadlineJa, heroSlides as defaultSlides, type HeroSlide } from "@/data/home";
import { heroHeadlineZh as defaultHeadlineZh } from "@/data/home.zh";
import { DEFAULT_OBJECT_POSITION } from "@/lib/objectPosition";

export type { HeroSlide };

export interface HomeHeroData {
  headline: string;
  slides: HeroSlide[];
}

// Content is managed via the Polaris CMS (Cloudflare Pages + D1 + R2). See /cms.
const CMS_API_URL = process.env.CMS_API_URL ?? "https://polaris.api.yingmu-tech.com";

/** Revalidated periodically so edits made in the CMS admin show up without a
 * full redeploy of the Vercel site. Falls back to the hardcoded defaults if
 * the CMS is unreachable or has no data yet, so the homepage hero never
 * breaks. */
const REVALIDATE_SECONDS = 300;

export async function getHomeHero(locale: "ja" | "zh"): Promise<HomeHeroData> {
  const fallback: HomeHeroData = {
    headline: locale === "zh" ? defaultHeadlineZh : defaultHeadlineJa,
    slides: defaultSlides,
  };

  try {
    const res = await fetch(`${CMS_API_URL}/api/home-hero?locale=${locale}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return fallback;

    const data: {
      headline?: string;
      slides?: { src: string; objectPosition?: { x: number; y: number } }[];
    } = await res.json();
    const slides =
      Array.isArray(data.slides) && data.slides.length > 0
        ? data.slides.map((slide) => ({
            image: slide.src,
            objectPosition: slide.objectPosition ?? DEFAULT_OBJECT_POSITION,
          }))
        : fallback.slides;
    const headline = typeof data.headline === "string" && data.headline.trim() ? data.headline : fallback.headline;

    return { headline, slides };
  } catch {
    return fallback;
  }
}
