/**
 * robots.txt
 *
 * Note what this file deliberately does NOT do: it doesn't list the hidden
 * categories or /all. Two reasons. First, robots.txt is public, so disallowing
 * /fashion would announce /fashion to anyone who reads it. Second, Disallow
 * blocks crawling, and a page that is never crawled is never seen to carry its
 * noindex tag, which is what actually keeps it out of results.
 *
 * So the hidden routes stay crawlable and carry `robots: noindex` from
 * generateMetadata in app/(site)/[category]/page.tsx. Only the admin and API
 * surfaces are blocked here, and the sitemap lists the public read.
 */

import type { MetadataRoute } from "next";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://enrikacreates.com"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/api/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
