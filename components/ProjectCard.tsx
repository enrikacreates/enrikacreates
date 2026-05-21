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
import type { ProjectListItem } from "@/lib/types";

interface ProjectCardProps {
  item: ProjectListItem;
  /** Index in the grid — drives the rotating layout (1–5) like vanilla. */
  index: number;
}

export function ProjectCard({ item, index }: ProjectCardProps) {
  const layout = (index % 5) + 1;
  const isDark = isDarkColor(item.color);
  const collageUrl = item.leadImage?.asset
    ? urlFor(item.leadImage).width(900).height(900).fit("crop").auto("format").url()
    : undefined;
  const hasImage = Boolean(collageUrl);

  const className = [
    "catalog-item",
    "style-graphic",
    `layout-${layout}`,
    isDark ? "dark-card" : "",
    hasImage ? "has-collage" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      href={`/work/${item.slug}`}
      className={className}
      style={{ "--card-color": item.color, animationDelay: `${index * 0.05}s` } as React.CSSProperties}
      aria-label={`${item.title} — ${item.tagline}`}
    >
      <CardInner layout={layout} item={item} collageUrl={collageUrl} />
    </Link>
  );
}
