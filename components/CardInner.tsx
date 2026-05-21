/**
 * CardInner — the shape/content markup shared by the catalog card AND the
 * project-detail hero (card-as-hero treatment).
 *
 * MIGRATION TEMPLATE NOTE:
 *   Extracted from vanilla renderCardLayout() so the same five layouts render
 *   identically on the grid card and the blown-up detail hero.
 */

import type { ProjectListItem } from "@/lib/types";

export function CardInner({
  layout,
  item,
  collageUrl,
  hideContent = false,
}: {
  layout: number;
  item: ProjectListItem;
  collageUrl?: string;
  /** When true, omit the text band — used by the detail hero, which renders
   *  its title block BELOW the image instead of overlaid on it. */
  hideContent?: boolean;
}) {
  const year = item.year || "";
  const title = hideContent ? "" : item.title;
  const tagline = hideContent ? "" : item.tagline || "";

  const collage = collageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="card-collage" src={collageUrl} alt="" loading="lazy" aria-hidden="true" />
  ) : null;

  if (hideContent) {
    // Image + shapes only (no text band) — for the detail-page hero.
    switch (layout) {
      case 1:
        return (
          <>
            <div className="card-shape-zone">
              <span className="shape shape-circle" />
              <span className="shape shape-half" />
            </div>
            {collage}
          </>
        );
      case 3:
        return (
          <>
            <div className="card-year-hero">{year}</div>
            {collage}
          </>
        );
      case 4:
        return (
          <>
            <div className="card-split" />
            <div className="card-shape-zone tucked">
              <span className="shape shape-half" />
            </div>
            {collage}
          </>
        );
      case 5:
        return (
          <>
            <div className="card-shape-zone grid">
              <span className="shape shape-square" />
              <span className="shape shape-circle small" />
            </div>
            {collage}
          </>
        );
      case 2:
      default:
        return (
          <>
            <div className="card-shape-zone center">
              <span className="shape shape-circle big" />
              <span className="shape shape-triangle" />
            </div>
            {collage}
          </>
        );
    }
  }

  switch (layout) {
    case 1:
      return (
        <>
          <div className="card-shape-zone">
            <span className="shape shape-circle" />
            <span className="shape shape-half" />
          </div>
          {collage}
          <div className="card-content">
            <span className="card-year">{year}</span>
            <h3 className="card-title">{title}</h3>
            <p className="card-tagline">{tagline}</p>
          </div>
        </>
      );
    case 2:
      return (
        <>
          <div className="card-shape-zone center">
            <span className="shape shape-circle big" />
            <span className="shape shape-triangle" />
          </div>
          {collage}
          <div className="card-content bottom">
            <span className="card-year inline">{year}</span>
            <h3 className="card-title">{title}</h3>
            <p className="card-tagline">{tagline}</p>
          </div>
        </>
      );
    case 3:
      return (
        <>
          <div className="card-year-hero">{year}</div>
          {collage}
          <div className="card-content bottom">
            <h3 className="card-title">{title}</h3>
            <p className="card-tagline">{tagline}</p>
          </div>
        </>
      );
    case 4:
      return (
        <>
          <div className="card-split" />
          <div className="card-shape-zone tucked">
            <span className="shape shape-half" />
          </div>
          {collage}
          <div className="card-content bottom">
            <span className="card-year">{year}</span>
            <h3 className="card-title">{title}</h3>
            <p className="card-tagline">{tagline}</p>
          </div>
        </>
      );
    case 5:
    default:
      return (
        <>
          <div className="card-shape-zone grid">
            <span className="shape shape-square" />
            <span className="shape shape-circle small" />
          </div>
          {collage}
          <div className="card-content bottom">
            <span className="card-year">{year}</span>
            <h3 className="card-title">{title}</h3>
            <p className="card-tagline">{tagline}</p>
          </div>
        </>
      );
  }
}
