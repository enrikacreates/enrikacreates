/**
 * Previous / next case, in the side margins of a project page.
 *
 * Reading one case study and wanting the next is the common path through a
 * portfolio, and until now it cost a trip back to the home grid and a hunt for
 * where you'd got to. These sit in the margin the detail column already leaves
 * empty, so they cost no vertical space.
 *
 * The order is the home page's order, deliberately: featured row first, then
 * the catalog, both poster-gated. Anything else and "next" would mean one thing
 * on the grid and another here.
 *
 * It wraps, so the last case leads back to the first rather than dead-ending.
 *
 * Server component; they're links, not state.
 */

import Link from "next/link";

export type CaseLink = { slug: string; title: string };

export function CaseNav({ prev, next }: { prev?: CaseLink; next?: CaseLink }) {
  if (!prev && !next) return null;

  return (
    <nav className="case-nav" aria-label="Other case studies">
      {prev && (
        <Link
          href={`/work/${prev.slug}`}
          className="case-nav-btn prev"
          aria-label={`Previous case study: ${prev.title}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="case-nav-title">{prev.title}</span>
        </Link>
      )}
      {next && (
        <Link
          href={`/work/${next.slug}`}
          className="case-nav-btn next"
          aria-label={`Next case study: ${next.title}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="case-nav-title">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
