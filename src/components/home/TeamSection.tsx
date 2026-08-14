import TeamCarousel from "./TeamCarousel";
import { getTeamMembers } from "@/lib/team";
import type { PostLocale } from "@/lib/posts";

interface TeamCarouselLabels {
  eyebrow: string;
  title: string;
  detailBtn: string;
  contactBtn: string;
  introSectionTitle: string;
  languageSectionTitle: string;
}

/** Server-component wrapper that feeds `TeamCarousel` with the members
 * actually published in the CMS, instead of a hardcoded list. */
export default async function TeamSection({
  locale,
  labels,
}: {
  locale: PostLocale;
  labels?: TeamCarouselLabels;
}) {
  const members = await getTeamMembers(locale);
  const contactHref = locale === "zh" ? "/zh/contact" : "/contact";

  return <TeamCarousel members={members} contactHref={contactHref} labels={labels} />;
}
