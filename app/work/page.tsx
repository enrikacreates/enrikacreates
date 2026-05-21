/**
 * Work catalog — filter bar + featured row + project grid.
 *
 * MIGRATION TEMPLATE NOTE:
 *   Server Component. Fetches all projects + featured once, filters by the
 *   `?filter=` search param. FilterBar (client) changes the param; the grid
 *   re-renders server-side on navigation (cached, fast).
 *
 *   Was the hidden ".work" section on the vanilla home page — now its own route.
 */

import Link from "next/link";
import { getAllProjects, getFeaturedProjects } from "@/lib/sanity/fetch";
import { FilterBar } from "@/components/FilterBar";
import { ProjectCard } from "@/components/ProjectCard";
import { isDarkColor } from "@/lib/colorUtils";

export const metadata = {
  title: "Work — Enrika Creates",
  description: "Selected design work across fashion, product, apps, web, and more.",
};

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "all" } = await searchParams;
  const [allProjects, featured] = await Promise.all([
    getAllProjects(),
    getFeaturedProjects(),
  ]);

  const items =
    filter === "all"
      ? allProjects
      : allProjects.filter((p) => p.category === filter);

  return (
    <section className="work is-revealed" id="work">
      <FilterBar active={filter} />

      <div className="work-inner">
        {/* Featured highlights (don't change with filter) */}
        {featured.length > 0 && (
          <div className="sub-hero-inner">
            {featured.map((item, i) => (
              <Link
                key={item._id}
                href={`/work/${item.slug}`}
                className={`featured-item animate-on-scroll${isDarkColor(item.color) ? " dark-card" : ""}`}
                data-anim="fade-up"
                data-delay={i * 150}
                style={{ backgroundColor: item.color }}
              >
                <span className="featured-label">Featured</span>
                <h3>{item.title}</h3>
                <p className="featured-cat">{item.tagline}</p>
              </Link>
            ))}
          </div>
        )}

        {/* Catalog grid (filtered) */}
        <div className="catalog-grid" id="catalog-grid">
          {items.length === 0 ? (
            <div className="catalog-empty">No work in this category yet.</div>
          ) : (
            items.map((item, i) => (
              <ProjectCard key={item._id} item={item} index={i} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
