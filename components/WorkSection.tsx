"use client";

/**
 * Work section — filter bar + featured row + catalog grid, rendered ON the
 * home page (single-page model, like the original vanilla site).
 *
 * MIGRATION TEMPLATE NOTE:
 *   Client-side filtering (local state, no navigation) so changing a filter
 *   doesn't reload or scroll. Always in the document: scrolling past the hero
 *   carries you into it, no click required.
 */

import Link from "next/link";
import { useState } from "react";
import { ProjectCard } from "./ProjectCard";
import { isDarkColor } from "@/lib/colorUtils";
import type { Category, ProjectListItem } from "@/lib/types";

interface WorkSectionProps {
  projects: ProjectListItem[];
  featured: ProjectListItem[];
  /** Public categories, in display order. Drives the pills. */
  categories: Category[];
}

export function WorkSection({
  projects,
  featured,
  categories,
}: WorkSectionProps) {
  const [filter, setFilter] = useState("all");

  // The featured row sits directly above the grid, so leaving these in the
  // catalog too showed each of them twice on one screen. Featured is a tier,
  // not a copy.
  const featuredIds = new Set(featured.map((f) => f._id));
  const catalog = projects.filter((p) => !featuredIds.has(p._id));

  const items =
    filter === "all"
      ? catalog
      : catalog.filter((p) => p.category?.slug === filter);

  // "All" first, then each public category. Hidden categories are absent by
  // design; they're reachable at their own URL and from /all.
  const pills = [
    { value: "all", label: "All" },
    ...categories.map((c) => ({ value: c.slug, label: c.title })),
  ];

  return (
    <section className="work" id="work">
      <nav className="filter-bar" id="filter-bar">
        {pills.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`filter-btn${filter === value ? " active" : ""}`}
            data-filter={value}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="work-inner">
        {featured.length > 0 && (
          <h2 className="work-heading">Featured</h2>
        )}

        {featured.length > 0 && (
          <div className="sub-hero-inner">
            {featured.map((item, i) => (
              <Link
                key={item._id}
                href={`/work/${item.slug}`}
                className={`featured-item${isDarkColor(item.color) ? " dark-card" : ""}`}
                data-anim="fade-up"
                data-delay={i * 150}
                style={{ backgroundColor: item.color }}
              >
                <h3>{item.title}</h3>
                <p className="featured-cat">{item.tagline}</p>
              </Link>
            ))}
          </div>
        )}

        {featured.length > 0 && items.length > 0 && (
          <hr className="work-divider" />
        )}

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
