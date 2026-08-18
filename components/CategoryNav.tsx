/**
 * Category nav — the sticky pill bar on the routed catalog pages.
 *
 * This is the navigational sibling of <WorkSection>'s in-page filter. On the
 * home page, filtering is local state so the single-page reveal never reloads.
 * On /work, /all, and /[category] the same pills are real links, because those
 * URLs are the point: each one is shareable on its own.
 *
 * `categories` is whatever the caller decided should be visible. Public pages
 * pass the listed ones; /all passes every category, so a link handed to a
 * specific person opens the full breadth of the work.
 */

import Link from "next/link";
import type { Category } from "@/lib/types";

interface CategoryNavProps {
  categories: Category[];
  /** Slug of the active category, or "all" for the full overview. */
  active: string;
  /**
   * Where the leading pill points. /all is its own overview, since it's the
   * only page showing every category. Public category pages point back at the
   * home catalog: the site keeps the vanilla single-page model, so the full
   * public grid lives at /#work rather than on a route of its own.
   */
  overview?: { href: string; label: string; key?: string };
}

export function CategoryNav({
  categories,
  active,
  overview = { href: "/#work", label: "All", key: "all" },
}: CategoryNavProps) {
  const pills = [
    {
      href: overview.href,
      label: overview.label,
      key: overview.key ?? overview.href.replace(/^\//, ""),
    },
    ...categories.map((c) => ({
      href: `/${c.slug}`,
      label: c.title,
      key: c.slug,
    })),
  ];

  return (
    <nav className="filter-bar" id="filter-bar" aria-label="Work categories">
      {pills.map((pill) => {
        const isActive = active === pill.key;
        return (
          <Link
            key={pill.href}
            href={pill.href}
            className={`filter-btn${isActive ? " active" : ""}`}
            data-filter={pill.key}
            aria-current={isActive ? "page" : undefined}
          >
            {pill.label}
          </Link>
        );
      })}
    </nav>
  );
}
