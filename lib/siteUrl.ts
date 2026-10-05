/**
 * The site's canonical address, in one place.
 *
 * Three files used to carry their own answer and none of them agreed:
 * layout.tsx said enrikacreates.vercel.app, robots.ts and sitemap.ts both said
 * enrikacreates.com, and the site actually lives at enrikagreathouse.com with
 * www 308ing to it. That mattered in a way that is easy to miss: metadataBase
 * is what canonicals and share previews resolve against, and the sitemap tells
 * search engines which URLs to index, so between them they were pointing at
 * two addresses that were not the one being served.
 *
 * Overridable by env so a preview deployment can describe itself accurately
 * rather than claiming to be production.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://enrikagreathouse.com"
).replace(/\/$/, "");
