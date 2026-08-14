import NewsSection from "./NewsSection";
import { getLatestNewsItems, type PostLocale } from "@/lib/posts";

/** Server-component wrapper that feeds `NewsSection` with the latest posts
 * actually published in the CMS, instead of a hardcoded list. */
export default async function LatestNewsSection({
  locale,
  moreHref,
  moreLabel,
  limit = 2,
}: {
  locale: PostLocale;
  moreHref?: string;
  moreLabel?: string;
  limit?: number;
}) {
  const items = await getLatestNewsItems(locale, limit);

  return <NewsSection items={items} moreHref={moreHref} moreLabel={moreLabel} />;
}
