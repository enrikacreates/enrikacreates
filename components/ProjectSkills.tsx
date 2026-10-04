"use client";

/**
 * The skills chips, above the story rather than closing it.
 *
 * They used to sit at the end, which on betterstories put them 1314px down the
 * page: three paragraphs past the fold. For a hiring portfolio that is the
 * wrong way round, because the chips are the most scannable thing on the page
 * and the first thing a recruiter looks for.
 *
 * A fixed rail in the margin was the other candidate and is why this is a
 * component at all. Centred won: the margin only exists above a certain width
 * AND height, so a rail needed a second copy of the chips for narrow screens
 * plus guards to keep it clear of the case chevrons. Centred needs none of
 * that and reads the same at every size.
 *
 * A chip is only a button when the skill is actually shared. Counted across the
 * live projects, 17 of 27 distinct skills appear on exactly one of them, which
 * is 34% of the chips on screen: making all of them clickable would mean a
 * third of clicks opening a list containing only the page you are already on.
 * Shared chips get a button; the rest stay what they always were.
 */

import { useState } from "react";
import Link from "next/link";

export type RelatedBySkill = Record<string, { slug: string; title: string }[]>;

export function ProjectSkills({
  skills,
  related = {},
}: {
  skills: string[];
  related?: RelatedBySkill;
}) {
  const [open, setOpen] = useState<string | null>(null);

  if (skills.length === 0) return null;

  const others = open ? related[open] ?? [] : [];

  return (
    <section className="project-skills">
      <p className="project-skills-label">Skills</p>

      <ul className="project-skills-list">
        {skills.map((s) => {
          const shared = (related[s] ?? []).length > 0;
          if (!shared) return <li key={s}>{s}</li>;
          return (
            <li key={s} className="is-shared">
              <button
                type="button"
                className={open === s ? "is-open" : undefined}
                aria-expanded={open === s}
                onClick={() => setOpen(open === s ? null : s)}
              >
                {s}
                <span className="skill-count">{(related[s] ?? []).length}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {open && (
        <div className="skill-related" role="region" aria-label={`Other work using ${open}`}>
          <p className="skill-related-label">
            Also used in
            <button type="button" className="skill-related-close" onClick={() => setOpen(null)} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </p>
          <ul>
            {others.map((p) => (
              <li key={p.slug}>
                <Link href={`/work/${p.slug}`}>{p.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
