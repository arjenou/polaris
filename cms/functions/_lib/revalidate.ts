import type { Env } from "./env";

export type RevalidateKind = "news" | "recommended";

/**
 * Best-effort on-demand revalidation call to the Next.js site so content edits
 * show up immediately instead of waiting for its 5-minute timed ISR window.
 * Never throws — a revalidation failure (site down, misconfigured secret,
 * etc.) must not prevent the CMS save/delete itself from succeeding.
 */
export async function triggerRevalidate(
  env: Env,
  params: { kind?: RevalidateKind; locale: string; slug: string },
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
