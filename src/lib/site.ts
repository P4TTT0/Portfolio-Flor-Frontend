/**
 * Absolute origin of the deployed site.
 *
 * Canonical URLs, Open Graph tags, the sitemap and JSON-LD all need an absolute
 * URL, and a relative one silently breaks every one of them. Set
 * `NEXT_PUBLIC_SITE_URL` in the deployment environment; Vercel exposes its own
 * generated host as a fallback for preview builds.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");
