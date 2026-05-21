"use client";

/**
 * Work section — filter bar + featured row + catalog grid, rendered ON the
 * home page (single-page model, like the original vanilla site).
 *
 * MIGRATION TEMPLATE NOTE:
 *   Client-side filtering (local state, no navigation) so changing a filter
 *   doesn't reload or scroll. Hidden until `revealed` (set when "View Work"
 *   is clicked) — matches the vanilla reveal-then-scroll behavior.
 */

import Link from "next/link";
import { useState } from "react";
import { ProjectCard } from "./ProjectCard";
import { FILTER_LABELS, isDarkColor } from "@/lib/colorUtils";
import type { ProjectListItem } from "@/lib/types";

interface WorkSectionProps {
  projects: ProjectListItem[];
  featured: ProjectListItem[];
  revealed: boolean;
}

export function WorkSection({ projects, featured, revealed }: WorkSectionProps) {
  const [filter, setFilter] = useState("all");

  const items =
    filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section className={`work${revealed ? " is-revealed" : ""}`} id="work">
      <nav className="filter-bar" id="filter-bar">
        {Object.entries(FILTER_LABELS).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`filter-btn${filter === value ? " active" : ""}`}
            data-filter={value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="work-inner">
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
                <span className="featured-label">Featured</span>
                <h3>{item.title}</h3>
                <p className="featured-cat">{item.tagline}</p>
              </Link>
            ))}
          </div>
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
