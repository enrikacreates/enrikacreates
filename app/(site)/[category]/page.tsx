/**
 * Category route — /mobile, /web, /fashion, /product, /event, /writing, /all.
 *
 * One dynamic segment serves two jobs:
 *
 *   /all          the full breadth of the work, every category included. Not
 *                 linked from anywhere and marked noindex, so it exists to be
 *                 pasted into a message to a specific person.
 *   /<slug>       a single category. Every category gets a route whether or not
 *                 it's listed, so nothing is ever unreachable; `listed` only
 *                 controls whether it's advertised (nav, sitemap, indexing).
 *
 * Static segments win over dynamic ones in the App Router, so /work, /blog, and
 * /studio are never captured here. The category schema also refuses those slugs
 * (RESERVED_SLUGS), so a Studio edit can't create a collision either.
 *
 * MIGRATION TEMPLATE NOTE:
 *   The vanilla site pushed /fashion via history.pushState with no real page
 *   behind it. These are real SSR routes: shareable, crawlable when we want
 *   them to be, and 404-ing honestly when the slug doesn't exist.
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllCategories,
  getCategoryBySlug,
  getAllProjects,
  getProjectsByCategory,
} from "@/lib/sanity/fetch";
import { CategoryNav } from "@/components/CategoryNav";
import { ProjectCard } from "@/components/ProjectCard";

/** The overview slug that shows every category at once. */
const ALL = "all";

/** Unlisted categories and /all are reachable but never advertised. */
const NOINDEX = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
} as const;

export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return [{ category: ALL }, ...categories.map((c) => ({ category: c.slug }))];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;

  if (slug === ALL) {
    return {
      title: "All work — Enrika Creates",
      description:
        "The full range of the work: mobile, web, product, fashion, events, and writing.",
      robots: NOINDEX,
    };
  }

  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Not found — Enrika Creates" };

  return {
    title: `${category.title} — Enrika Creates`,
    description:
      category.blurb ?? `Selected ${category.title.toLowerCase()} work by Enrika.`,
    // Listed categories are part of the public read; the rest stay out of search.
    ...(category.listed ? {} : { robots: NOINDEX }),
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const isAll = slug === ALL;

  const [allCategories, projects, category] = await Promise.all([
    getAllCategories(),
    isAll ? getAllProjects() : getProjectsByCategory(slug),
    isAll ? Promise.resolve(null) : getCategoryBySlug(slug),
  ]);

  if (!isAll && !category) notFound();

  // /all is the unlisted overview, so its nav shows every category. A single
  // category page shows the public set plus itself, so landing on a hidden
  // category from a direct link doesn't strand you with no way back.
  const navCategories = isAll
    ? allCategories
    : allCategories.filter((c) => c.listed || c.slug === slug);

  const heading = isAll ? "All work" : category!.title;
  const blurb = isAll
    ? "Everything, across every discipline."
    : category!.blurb;

  return (
    <section className="work is-revealed work--routed" id="work">
      <CategoryNav
        categories={navCategories}
        active={isAll ? ALL : slug}
        overview={
          isAll ? { href: `/${ALL}`, label: "All", key: ALL } : undefined
        }
      />

      <div className="work-inner">
        <header className="category-header">
          <h1 className="category-title">{heading}</h1>
          {blurb && <p className="category-blurb">{blurb}</p>}
          <p className="category-count">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </p>
        </header>

        <div className="catalog-grid" id="catalog-grid">
          {projects.length === 0 ? (
            <div className="catalog-empty">No work in this category yet.</div>
          ) : (
            projects.map((item, i) => (
              <ProjectCard key={item._id} item={item} index={i} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
