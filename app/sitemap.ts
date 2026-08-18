/**
 * Sitemap — the public read of the site.
 *
 * Only listed categories and their projects appear here. Hidden categories and
 * /all are deliberately absent: they stay live and shareable by link, but the
 * version of this site a search engine sees is the focused one.
 */

import type { MetadataRoute } from "next";
import {
  getListedCategories,
  getListedProjects,
  getAllPostSlugs,
} from "@/lib/sanity/fetch";

export const revalidate = 3600;

/** Set NEXT_PUBLIC_SITE_URL in Vercel; the fallback keeps local builds valid. */
const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://enrikacreates.com"
).replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, projects, postSlugs] = await Promise.all([
    getListedCategories(),
    getListedProjects(),
    getAllPostSlugs(),
  ]);

  const url = (path: string) => `${BASE_URL}${path}`;

  return [
    { url: url("/"), changeFrequency: "monthly", priority: 1 },
    { url: url("/blog"), changeFrequency: "weekly", priority: 0.7 },

    ...categories.map((c) => ({
      url: url(`/${c.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),

    ...projects.map((p) => ({
      url: url(`/work/${p.slug}`),
      lastModified: p.publishedAt ? new Date(p.publishedAt) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),

    ...postSlugs.map((slug) => ({
      url: url(`/blog/${slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
