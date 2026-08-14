import type { Env } from "./env";

export type RevalidateKind = "news" | "recommended" | "team" | "events" | "gallery" | "advantages";

/**
 * Best-effort on-demand revalidation call to the Next.js site so content edits
 * show up immediately instead of waiting for its 5-minute timed ISR window.
 * Never throws — a revalidation failure (site down, misconfigured secret,
 * etc.) must not prevent the CMS save/delete itself from succeeding.
 *
 * `slug` is optional because "team" has no dedicated list/detail page — it
 * only ever revalidates the homepage carousel. `pageKey` is used by "gallery"
 * and "advantages" to identify which of the three fixed pages changed;
 * `locale` is ignored for "gallery" (images are shared across ja/zh, both
 * language pages are always revalidated together) but respected for
 * "advantages" (text differs per locale, so only that locale's page is
 * revalidated).
 */
export async function triggerRevalidate(
  env: Env,
  params: { kind?: RevalidateKind; locale?: string; slug?: string; pageKey?: string },
): Promise<void> {
  if (!env.SITE_URL || !env.REVALIDATE_SECRET) return;

  try {
    await fetch(new URL("/api/revalidate", env.SITE_URL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": env.REVALIDATE_SECRET,
        // Bypasses Vercel's Deployment Protection while the site has no
        // custom domain yet. Harmless/no-op once that's no longer needed.
        ...(env.VERCEL_PROTECTION_BYPASS_SECRET
          ? { "x-vercel-protection-bypass": env.VERCEL_PROTECTION_BYPASS_SECRET }
          : {}),
      },
      body: JSON.stringify({ kind: "news", ...params }),
    });
  } catch (err) {
    console.error("Revalidation request failed:", err);
  }
}
