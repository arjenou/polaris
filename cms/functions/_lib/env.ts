/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  SESSION_SECRET: string;
  /** Public Next.js site origin, used to trigger on-demand revalidation after
   * news changes. Optional — if unset, revalidation is silently skipped and
   * the site falls back to its 5-minute timed ISR. */
  SITE_URL?: string;
  REVALIDATE_SECRET?: string;
  /** Only needed while the Next.js site has no custom domain yet and is
   * still sitting behind Vercel's default Deployment Protection (Vercel
   * Authentication) on its *.vercel.app URL. See "Protection Bypass for
   * Automation" in the Vercel project's Deployment Protection settings. */
  VERCEL_PROTECTION_BYPASS_SECRET?: string;
}
