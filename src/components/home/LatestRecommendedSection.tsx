import RecommendedSection from "./RecommendedSection";
import { getLatestRecommendedItems } from "@/lib/recommended";
import type { PostLocale } from "@/lib/posts";

/** Server-component wrapper that feeds `RecommendedSection` with the latest
 * posts actually published in the CMS, instead of a hardcoded list. */
export default async function LatestRecommendedSection({
  locale,
  eyebrow,
  title,
  moreHref,
  moreLabel,
  limit = 3,
}: {
  locale: PostLocale;
  eyebrow?: string;
  title?: string;
  moreHref?: string;
  moreLabel?: string;
  limit?: number;
}) {
  const items = await getLatestRecommendedItems(locale, limit);

  return <RecommendedSection eyebrow={eyebrow} title={title} items={items} moreHref={moreHref} moreLabel={moreLabel} />;
}
