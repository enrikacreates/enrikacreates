/**
 * Project detail page — /work/[slug].
 *
 * MIGRATION TEMPLATE NOTE:
 *   Was a modal overlay in vanilla (openProjectDetail). Now a real SSR page:
 *   deep-linkable, indexable, with proper back navigation.
 *
 *   Hero = the card design blown up (card-as-hero), so the grid card and the
 *   detail hero render identically. Story sections, skills, slideshow, and
 *   gallery follow.
 *
 *   Three hero treatments exist, switched by HERO_TREATMENT below:
 *
 *   "none"    no hero image at all. Kept as an option, not current.
 *
 *   Once the posters became full 4:5 compositions, the detail hero was a
 *   portrait plate filling most of the first viewport with art the reader had
 *   just clicked on from the grid. It repeated the card and pushed the title,
 *   the tagline and the first screenshot below the fold. The poster now runs
 *   as a banner instead: a wide crop of the same art, which keeps the colour
 *   and the texture while giving the space back to the words. See
 *   .project-hero.has-flat in globals.css for the banner itself.
 *
 *   "poster"  the project's poster artwork, the same art the grid card shows.
 *   "shapes"  the original CardInner composition of discs and triangles over
 *             the lead image.
 *
 *   Poster is the default because shapes left most of the first viewport
 *   empty: on a project whose lead image is absent or pale, the hero was a
 *   field of card colour with one disc and a small triangle, and the title sat
 *   below the fold. That is the first thing anyone sees after clicking a card.
 *
 *   The shapes path is kept intact rather than deleted. Flip the constant to
 *   bring it back everywhere, and a project with no poster still falls back to
 *   it automatically.
 */

import { existsSync } from "node:fs";
import path from "node:path";

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  getAllProjectSlugs,
  getFeaturedProjects,
  getListedProjects,
} from "@/lib/sanity/fetch";
import { urlFor } from "@/lib/sanity/image";
import { isDarkColor } from "@/lib/colorUtils";
import { CardInner } from "@/components/CardInner";
import { PosterArt } from "@/components/PosterArt";
import { getPoster } from "@/lib/posters";
import { Slideshow } from "@/components/Slideshow";
import { KeyScreens } from "@/components/KeyScreens";
import { ProcessTimeline } from "@/components/ProcessTimeline";
import { Gallery } from "@/components/Gallery";
import { CaseNav } from "@/components/CaseNav";
import { ProjectSkills } from "@/components/ProjectSkills";

/** Which hero treatment to render. See the note at the top of this file. */
const HERO_TREATMENT: "poster" | "shapes" | "none" = "poster";

export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Not found — Enrika Creates" };
  return {
    title: `${project.title} — Enrika Creates`,
    description: project.oneline || project.tagline,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [item, featured, listed] = await Promise.all([
    getProjectBySlug(slug),
    getFeaturedProjects(),
    getListedProjects(),
  ]);
  if (!item) notFound();

  // The home page's own order: featured row, then the catalog, both gated on
  // having a poster. Rebuilt here rather than shared because the home grid
  // composes it inside a client component; if a third place ever needs it, it
  // should move into lib rather than be copied again.
  const featuredIds = new Set(featured.map((f) => f._id));
  const sequence = [
    ...featured,
    ...listed.filter((p) => !featuredIds.has(p._id)),
  ].filter((p) => getPoster(p.slug));

  // Where the case-study chip points, if anywhere.
  //
  // A field in the Studio wins; otherwise a hand-built deck at /case/<slug>
  // counts, checked on disk so writing one is all it takes to make the chip
  // appear. Two of the nine have a deck today, so this is deliberately absent
  // rather than a dead link on the other seven.
  const caseHref =
    item.caseUrl ||
    (existsSync(path.join(process.cwd(), "public", "case", `${slug}.html`))
      ? `/case/${slug}`
      : undefined);
  // Say what the click actually does. A deck is a page you read; only a PDF is
  // a download, and labelling an HTML page "download" is a small lie that the
  // click immediately exposes.
  const caseIsFile = Boolean(caseHref && /\.pdf($|\?)/i.test(caseHref));

  const at = sequence.findIndex((p) => p.slug === slug);
  // Wraps, so the last case leads back to the first instead of dead-ending.
  const prev = at > -1 && sequence.length > 1
    ? sequence[(at - 1 + sequence.length) % sequence.length]
    : undefined;
  const next = at > -1 && sequence.length > 1
    ? sequence[(at + 1) % sequence.length]
    : undefined;

  const layout = 2; // detail hero uses the template layout (was item.layout || 2)
  const isDark = isDarkColor(item.color);
  const collageUrl = item.leadImage?.asset
    ? urlFor(item.leadImage).width(1200).height(1200).fit("crop").auto("format").url()
    : undefined;

  const heroClass = [
    "project-hero",
    "catalog-item",
    "style-graphic",
    `layout-${layout}`,
    isDark ? "dark-card" : "",
    collageUrl ? "has-collage" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // A project with no poster keeps the shapes hero, whatever the constant says.
  const poster = HERO_TREATMENT === "poster" ? getPoster(item.slug) : undefined;

  return (
    <section
      className={`project-detail is-open${isDark ? " dark-detail" : ""}`}
      id="project-detail"
      // When the artwork has a measured background colour, the page takes it
      // exactly rather than a tint mixed from the project's card colour. Equal
      // colours are what let the banner read as part of the page instead of a
      // band laid over it, with no edge softened to get there.
      data-poster-bg={poster?.bg ? "" : undefined}
      style={
        {
          "--detail-color": item.color,
          ...(poster?.bg ? { "--poster-bg": poster.bg } : {}),
        } as React.CSSProperties
      }
    >
      <Link href="/#work" className="project-back" aria-label="Back to all work">
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
          <path d="M7 1L1 7L7 13M1 7H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Back to work</span>
      </Link>

      <CaseNav
        prev={prev && { slug: prev.slug, title: prev.title }}
        next={next && { slug: next.slug, title: next.title }}
      />

      <div className="project-detail-inner" id="project-detail-inner">
        {/* Card-as-hero: the poster artwork, or the original shapes. Title
            drops below either way. Omitted entirely under "none".

            Inside the inner column, so the banner spans the same width as the
            writing under it. It ran full bleed for a while to escape its own
            side edges; matching the page to the poster's background colour
            deals with those directly, so the width stopped carrying that job. */}
        {HERO_TREATMENT !== "none" && (
          <div
            className={`${heroClass}${poster ? " has-poster" : ""}${poster?.flat ? " has-flat" : ""}`}
            data-poster={poster ? item.slug : undefined}
            // Which band of the poster the banner shows. Editorial per project:
            // on 50 States the middle of the poster is the same portrait as the
            // first screenshot below it, so centre read as the page saying the
            // same thing twice.
            data-banner-align={item.bannerAlign ?? "center"}
            style={
              {
                "--card-color": item.color,
                // An exact band beats the preset when one is set. Clamped here
                // rather than trusted: this comes from a CMS number field.
                ...(typeof item.bannerFocus === "number"
                  ? {
                      "--banner-focus": `${Math.min(100, Math.max(0, item.bannerFocus))}%`,
                    }
                  : {}),
              } as React.CSSProperties
            }
          >
            {poster ? (
              <PosterArt slug={item.slug} as="banner" />
            ) : (
              <CardInner layout={layout} item={item} collageUrl={collageUrl} hideContent />
            )}
          </div>
        )}

        {/* Title block — below the header image */}
        <header className="project-hero-caption">
          <span className="card-year">{item.year}</span>
          <h1 className="card-title">{item.title}</h1>
          <p className="card-tagline">{item.tagline}</p>
          {/* What kind of thing this is, in the project's own words. These
              already existed and already show under the card on the home grid;
              the detail page was the one place that dropped them. */}
          {item.signals && item.signals.length > 0 && (
            <ul className="project-signals">
              {item.signals.map((sig) => (
                <li key={sig}>{sig}</li>
              ))}
            </ul>
          )}

          {caseHref && (
            <a
              className="case-download"
              href={caseHref}
              target="_blank"
              rel="noopener noreferrer"
              {...(caseIsFile ? { download: "" } : {})}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {caseIsFile ? (
                  <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M4 5h16v14H4zM4 9h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
              <span>{caseIsFile ? "Download the case" : "Read the full case"}</span>
            </a>
          )}
        </header>

        {/* Skills above the story rather than closing it. On betterstories they
            sat 1314px down, three paragraphs past the fold, which is backwards
            for the most scannable thing on the page. Centred here instead of in
            the margin: it needs no duplicate copy for narrow screens and never
            has to dodge the case chevrons. */}
        {item.skills && item.skills.length > 0 && (
          <ProjectSkills skills={item.skills} />
        )}

        {/* Key screens — before the prose, so the product is the first thing
            seen rather than the fourth paragraph. */}
        {item.keyScreens && item.keyScreens.length > 0 && (
          <KeyScreens items={item.keyScreens} />
        )}

        {/* Story */}
        <div className="project-story">
          {item.oneline && <p className="project-oneline">{item.oneline}</p>}
          {item.oneline && <hr className="project-divider" />}
          {item.challenge && (
            <section className="project-section">
              <h3>Challenge</h3>
              <p>{item.challenge}</p>
            </section>
          )}
          {item.action && (
            <section className="project-section">
              <h3>Action</h3>
              <p>{item.action}</p>
            </section>
          )}
          {item.result && (
            <section className="project-section">
              <h3>Result</h3>
              <p>{item.result}</p>
            </section>
          )}

        </div>

        {/* Designs slideshow — the further screens, directly under the skills
            chips that close the story block. Moved above the process timeline:
            someone who wants more of the product shouldn't have to scroll past
            the research narrative to reach it. */}
        {item.slides && item.slides.length > 0 && (
          <Slideshow slides={item.slides} title={item.title} />
        )}

        {/* Research & process — the depth under the summary above */}
        {item.process && item.process.length > 0 && (
          <ProcessTimeline steps={item.process} />
        )}

        {/* Process gallery */}
        {item.gallery && item.gallery.length > 0 && (
          <Gallery items={item.gallery} intro={item.galleryIntro} title={item.title} />
        )}
      </div>
    </section>
  );
}
