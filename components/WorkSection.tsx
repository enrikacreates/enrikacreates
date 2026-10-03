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
import { useState, useEffect } from "react";
import { ProjectCard } from "./ProjectCard";
import { isDarkColor } from "@/lib/colorUtils";
import { urlFor } from "@/lib/sanity/image";
import { PosterArt } from "./PosterArt";
import { getPoster } from "@/lib/posters";
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
  const [menuOpen, setMenuOpen] = useState(false);

  // Escape closes, and the page stops scrolling behind the open sheet.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // The featured row sits directly above the grid, so leaving these in the
  // catalog too showed each of them twice on one screen. Featured is a tier,
  // not a copy.
  const featuredIds = new Set(featured.map((f) => f._id));

  // Only projects with finished artwork are shown. A colour-block card next to
  // a finished poster reads as unfinished rather than as a different style, and
  // this is a hiring portfolio: three complete pieces beat nine with six
  // placeholders.
  //
  // Gated on the poster because that's the thing that's actually missing today.
  // Once the case studies are written too, this should become a `ready` boolean
  // on the project document so it's controlled from the Studio and applies to
  // /mobile, /web and /all as well — this only filters the home grid.
  const catalog = projects.filter(
    (p) => !featuredIds.has(p._id) && getPoster(p.slug)
  );

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

      {/* Mobile menu. Hidden above 768px, where the pills sit in the bar and the
          contact links sit top-right with room to spare. Below it, the corner
          mark, the pills and those links all want the same 72px strip and
          overlap, so the pills and links move in here behind one control. */}
      <button
        type="button"
        className={`nav-toggle${menuOpen ? " is-open" : ""}`}
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <div
        className={`nav-scrim${menuOpen ? " is-open" : ""}`}
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
      />

      <div
        id="mobile-menu"
        className={`nav-menu${menuOpen ? " is-open" : ""}`}
        // Kept out of the tab order while shut. The sheet uses visibility
        // rather than display:none so it can animate, and visibility:hidden
        // already removes it from the tab order; aria-hidden matches that for
        // assistive tech.
        aria-hidden={!menuOpen}
      >
        <p className="nav-menu-label">Browse</p>
        <ul className="nav-menu-list">
          {pills.map(({ value, label }) => (
            <li key={value}>
              <button
                type="button"
                className={`nav-menu-item${filter === value ? " active" : ""}`}
                aria-pressed={filter === value}
                // Explicit, because visibility:hidden did not actually keep
                // these out of the tab order here: focus still landed on them
                // while the sheet was shut.
                tabIndex={menuOpen ? 0 : -1}
                onClick={() => {
                  setFilter(value);
                  setMenuOpen(false);
                  document
                    .getElementById("work")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="work-inner">
        {featured.length > 0 && (
          <h2 className="work-heading">Recent Projects</h2>
        )}

        {featured.length > 0 && (
          <div className="sub-hero-inner">
            {featured.map((item, i) => {
              const poster = getPoster(item.slug);

              return (
                // Wrapper so the signals line can sit under the card without
                // being inside the link: it's a label, not a click target, and
                // folding it into the anchor would bloat the accessible name.
                <div className="featured-cell" key={item._id}>
                <Link
                  href={`/work/${item.slug}`}
                  className={`featured-item${isDarkColor(item.color) ? " dark-card" : ""}`}
                  data-anim="fade-up"
                  data-delay={i * 150}
                  // Hook for per-project poster tweaks that shouldn't leak to
                  // every card, e.g. tinting the blob under the torn hero.
                  data-poster={poster ? item.slug : undefined}
                  // --card-color rather than a literal background, so the
                  // card can derive tints from it (see --card-wash). This is
                  // what every other card already does.
                  style={{ "--card-color": item.color } as React.CSSProperties}
                >
                  {poster ? (
                    <PosterArt slug={item.slug} />
                  ) : (
                    item.leadImage?.asset && (
                      <span className="featured-blob-clip" aria-hidden="true">
                        <span className="featured-blob" />
                      </span>
                    )
                  )}

                  {!poster && item.leadImage?.asset && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="featured-art"
                      src={urlFor(item.leadImage).width(900).auto("format").url()}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                    />
                  )}
                  <h3>{item.title}</h3>
                  <p className="featured-cat">{item.tagline}</p>
                </Link>

                {item.signals && item.signals.length > 0 && (
                  <ul className="featured-signals">
                    {item.signals.map((sig) => (
                      <li key={sig}>{sig}</li>
                    ))}
                  </ul>
                )}
                </div>
              );
            })}
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
