/**
 * The layered poster artwork on a card.
 *
 * Shared by the featured row and the catalog grid so the two can't drift. The
 * layer positions themselves live in CSS keyed by `.poster-layer--<name>`,
 * which is what lets one composition be re-tuned without touching a component.
 *
 * The blob still needs clipping to the card; artwork that breaks the frame does
 * not. One `overflow` on the card can't do both, so the blob gets its own
 * clipping wrapper and the clipped layers ride along inside it.
 */

import Image from "next/image";

import { getPoster, getScreen, type Screen } from "@/lib/posters";

/**
 * `sizes` has to describe the box the image actually lands in, and this
 * component renders into two very different ones. On the grid a poster is a
 * third of a row; on a case page it is a banner the width of the content
 * column. Describing the card in both places made the browser fetch a 640px
 * variant for a 900px banner and upscale it 1.75x, on a 1x display.
 */
const SIZES = {
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  banner: "(max-width: 1000px) 100vw, 1000px",
} as const;

/** The plate's aspect, as height over width. Mirrors `.poster-plate`. */
const PLATE_RATIO = 9 / 8;

/**
 * How far up to slide the capture on hover, as a share of its own height.
 *
 * CSS can clip the window but can't know how tall the shot inside it is, so a
 * single hand-picked number scrolls a viewport-sized capture off the top and
 * barely moves a full-page one. This derives it instead: work out how much of
 * the image overflows its window, then use `travel` of that. One full-page
 * capture and one short one both end up scrolling the same proportion of
 * whatever they actually have.
 */
function revealFor({ top, width, ratio, travel = 0.7 }: Screen & { top: number; ratio: number }) {
  const windowH = PLATE_RATIO * (1 - top); // in card widths
  const imageH = width * ratio; // likewise
  const overflow = Math.max(0, 1 - windowH / imageH); // share of the image
  return 1 - travel * overflow;
}

export function PosterArt({
  slug,
  as = "card",
}: {
  slug: string;
  as?: keyof typeof SIZES;
}) {
  const poster = getPoster(slug);
  if (!poster) return null;
  const screen = getScreen(slug);

  // A finished poster is the whole card. It arrives at the card's own 4:5, so
  // `cover` crops nothing, and it already contains the ground, the colour field
  // and the browser window that the layered path below has to draw.
  //
  // next/image rather than a plain <img> purely for weight: the sources are
  // ~2MB PNGs, and this is a portfolio that gets sent out with a resume. The
  // optimiser serves AVIF/WebP at the size actually requested.
  if (poster.flat) {
    return (
      // The plate owns the 4:5 and the clipping, so the card around it is free
      // to be an auto-height column: artwork, then caption.
      <span className="poster-plate">
        <Image
          className="poster-flat"
          src={poster.flat}
          alt=""
          aria-hidden="true"
          fill
          sizes={SIZES[as]}
          draggable={false}
        />
        {screen && (
          // A real screen, seated where the compositor would have baked it and
          // free to move. The window clips; the shot inside it slides on hover,
          // so the card answers "what's in there" with the thing itself.
          <span
            className="poster-screen"
            style={
              {
                "--screen-top": `${screen.top * 100}%`,
                "--screen-width": `${screen.width * 100}%`,
                "--screen-reveal": `${(revealFor(screen) * 100).toFixed(2)}%`,
              } as React.CSSProperties
            }
            aria-hidden="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={screen.src} alt="" draggable={false} />
          </span>
        )}
      </span>
    );
  }

  const clipped = poster.layers.filter((l) => !l.breaksFrame);
  const overhanging = poster.layers.filter((l) => l.breaksFrame);

  return (
    <>
      <span className="featured-blob-clip" aria-hidden="true">
        {poster.blob && <span className="featured-blob" />}
        {/* A faint browser window behind the artwork, so a card reads as
            software at a glance. Drawn rather than an image so it inherits the
            card's own ink colour and costs no request. */}
        {poster.frame !== false && (
          <span className="poster-frame">
            <span className="poster-frame-bar">
              <i /><i /><i />
            </span>
          </span>
        )}
        {/* Layers sit inside a stage so a card type can rescale the whole
            composition at once. Scaling each layer on its own would move them
            relative to each other, because each would shrink toward its own top
            edge and the gaps between them would close at a different rate. The
            blob stays outside the stage: it's the ground, not part of the art. */}
        <span className="poster-stage">
          {clipped.map((l) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={l.name}
              className={`poster-layer poster-layer--${l.name}`}
              src={l.src}
              alt=""
              draggable={false}
            />
          ))}
        </span>
      </span>

      {overhanging.length > 0 && (
        <span className="poster-stage" aria-hidden="true">
          {overhanging.map((l) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={l.name}
              className={`poster-layer poster-layer--${l.name}`}
              src={l.src}
              alt=""
              draggable={false}
            />
          ))}
        </span>
      )}
    </>
  );
}
