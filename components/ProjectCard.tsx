/**
 * Project card — bold geometric "micro-story" card with optional collage image.
 *
 * MIGRATION TEMPLATE NOTE:
 *   Faithful port of vanilla renderCardLayout(). Five layout variants assigned
 *   by index (or item.displayOrder); shapes are CSS pseudo/spans, collage image
 *   layers on top when leadImage is present.
 *
 *   The whole card is a Next.js <Link> to /work/[slug] (was a modal-opening
 *   click handler in vanilla — now real navigation).
 */

import Link from "next/link";
import { urlFor } from "@/lib/sanity/image";
import { isDarkColor } from "@/lib/colorUtils";
import { CardInner } from "./CardInner";
import { PosterArt } from "./PosterArt";
import { getPoster } from "@/lib/posters";
import type { ProjectListItem } from "@/lib/types";

interface ProjectCardProps {
  item: ProjectListItem;
  /** Index in the grid — drives the rotating layout (1–5) like vanilla. */
  index: number;
}

export function ProjectCard({ item, index }: ProjectCardProps) {
  const layout = (index % 5) + 1;
  const isDark = isDarkColor(item.color);
  const poster = getPoster(item.slug);
  const collageUrl = item.leadImage?.asset
    ? urlFor(item.leadImage).width(900).height(900).fit("crop").auto("format").url()
    : undefined;
  const hasImage = Boolean(collageUrl);

  const className = [
    "catalog-item",
    "style-graphic",
    // A poster replaces the rotating shape layouts rather than joining them.
    // The decorative circles and triangles were the card's whole visual idea
    // when there was nothing else on it; against artwork they just compete,
    // which is exactly what the white triangle was doing on the bird's beak.
    poster ? "has-poster" : `layout-${layout}`,
    // A finished poster brings its own ground and its own 4:5, so the card
    // takes the ratio from the artwork and drops what the artwork already has.
    poster?.flat ? "has-flat" : "",
    isDark ? "dark-card" : "",
    hasImage && !poster ? "has-collage" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      href={`/work/${item.slug}`}
      className={className}
      // Same per-project CSS hook the featured cards use, so a poster tuned on
      // one card type carries to the other.
      data-poster={poster ? item.slug : undefined}
      style={{ "--card-color": item.color, animationDelay: `${index * 0.05}s` } as React.CSSProperties}
      aria-label={`${item.title} — ${item.tagline}`}
    >
      {poster ? (
        <>
          <PosterArt slug={item.slug} />
          <div className="card-content bottom">
            <span className="card-year">{item.year}</span>
            <h3 className="card-title">{item.title}</h3>
            <p className="card-tagline">{item.tagline}</p>
            {/* The same line the featured cards carry. The two rows were
                showing different things about the same projects for no reason
                other than that only one of them had been given it. */}
            {item.signals && item.signals.length > 0 && (
              <ul className="featured-signals">
                {item.signals.map((sig) => (
                  <li key={sig}>{sig}</li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <CardInner layout={layout} item={item} collageUrl={collageUrl} />
      )}
    </Link>
  );
}
