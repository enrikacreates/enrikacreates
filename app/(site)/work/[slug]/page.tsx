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
 *   Two hero treatments exist, switched by HERO_TREATMENT below:
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

import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getAllProjectSlugs } from "@/lib/sanity/fetch";
import { urlFor } from "@/lib/sanity/image";
import { isDarkColor } from "@/lib/colorUtils";
import { CardInner } from "@/components/CardInner";
import { PosterArt } from "@/components/PosterArt";
import { getPoster } from "@/lib/posters";
import { Slideshow } from "@/components/Slideshow";
import { KeyScreens } from "@/components/KeyScreens";
import { ProcessTimeline } from "@/components/ProcessTimeline";
import { Gallery } from "@/components/Gallery";

/** Which hero treatment to render. See the note at the top of this file. */
const HERO_TREATMENT: "poster" | "shapes" = "poster";

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
  const item = await getProjectBySlug(slug);
  if (!item) notFound();

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
      style={{ "--detail-color": item.color } as React.CSSProperties}
    >
      <Link href="/#work" className="project-back" aria-label="Back to all work">
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
          <path d="M7 1L1 7L7 13M1 7H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Back to work</span>
      </Link>

      <div className="project-detail-inner" id="project-detail-inner">
        {/* Card-as-hero: the poster artwork, or the original shapes. Title
            drops below either way. */}
        <div
          className={`${heroClass}${poster ? " has-poster" : ""}`}
          data-poster={poster ? item.slug : undefined}
          style={{ "--card-color": item.color } as React.CSSProperties}
        >
          {poster ? (
            <PosterArt slug={item.slug} />
          ) : (
            <CardInner layout={layout} item={item} collageUrl={collageUrl} hideContent />
          )}
        </div>

        {/* Title block — below the header image */}
        <header className="project-hero-caption">
          <span className="card-year">{item.year}</span>
          <h1 className="card-title">{item.title}</h1>
          <p className="card-tagline">{item.tagline}</p>
        </header>

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
          {item.skills && item.skills.length > 0 && (
            <section className="project-skills">
              <p className="project-skills-label">Skills</p>
              <ul className="project-skills-list">
                {item.skills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
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
