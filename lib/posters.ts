/**
 * Multi-layer poster artwork, keyed by project slug.
 *
 * EXPERIMENTAL. These read from `public/` rather than Sanity on purpose: we're
 * still finding the compositions, and tuning positions against local files is a
 * hot reload instead of an upload round-trip. Once the pattern settles this
 * becomes an array field on the project document and the map goes away.
 *
 * `breaksFrame` decides which side of the card's clipping wrapper a layer
 * renders on. Layers that don't break the frame are clipped to the card; layers
 * that do are free to overhang it. Nothing overhangs today, but the separate
 * export is what makes it possible at all: the hierarchy on a card (one element
 * large, another small, a third set behind) only exists because the pieces
 * aren't welded into one rectangle.
 *
 * `blob` is the cream field behind the artwork. Cut-out elements need something
 * to sit on; art that carries its own ground does not.
 *
 * Lives here rather than in a component because both card types use it: the
 * featured row and the catalog grid. One source, so the two can't drift.
 */

export interface PosterLayer {
  src: string;
  /** Also the CSS hook: `.poster-layer--<name>` carries its position. */
  name: string;
  breaksFrame: boolean;
}

export interface Poster {
  blob: boolean;
  /**
   * A faint browser window drawn behind the artwork, to say at a glance that
   * this project is software you open rather than an object you hold.
   *
   * On by default, because everything in the grid today is a digital product.
   * Set false for work that isn't: the textile and pattern pieces would be
   * actively misdescribed by a browser chrome behind them.
   */
  frame?: boolean;
  layers: PosterLayer[];
}

const POSTERS: Record<string, Poster> = {
  hummingbird: {
    blob: true,
    layers: [
      { src: "/assets/projects/hummingbird/waves.png", name: "waves", breaksFrame: false },
      { src: "/assets/projects/hummingbird/city.png", name: "city", breaksFrame: false },
      { src: "/assets/projects/hummingbird/bird.png", name: "bird", breaksFrame: false },
    ],
  },

  betterstories: {
    blob: true,
    layers: [
      { src: "/assets/projects/betterstories/disc.png", name: "disc", breaksFrame: false },
      { src: "/assets/projects/betterstories/desk.png", name: "desk", breaksFrame: false },
      { src: "/assets/projects/betterstories/window.png", name: "window", breaksFrame: false },
      // Video badge on the participant's portrait. Vector, and drawn on the
      // window's own canvas so it tracks the bubble automatically.
      { src: "/assets/projects/betterstories/play.svg", name: "bsplay", breaksFrame: false },
      { src: "/assets/projects/betterstories/accents.png", name: "accents", breaksFrame: false },
    ],
  },

  "50-states-of-freedom": {
    blob: true,
    layers: [
      {
        src: "/assets/projects/50-states-of-freedom/torn-hero.png",
        name: "torn",
        breaksFrame: false,
      },
    ],
  },

  // Split locally out of a flattened export by a colour test: the worktable is
  // pure ink linework, everything else is coloured. The table is currently
  // left out entirely, so this is the box, its rising contents and the disc.
  // `table.png` is still on disk if it earns its way back in.
  // Blob on, but sized under the artwork rather than around it (see the
  // [data-poster] override in globals.css). The collage brings its own ground
  // shapes, so this one is a disc for the garments to sit on, not a field to
  // contain them.
  // The generated reclining reader. Replaces the SVG I'd ported from the Read
  // Aloud landing page, which was a stopgap while there was no artwork.
  // hero.svg is still on disk if the cover-card idea comes back.
  //
  // Its ground came back as two diagonal bands of cream rather than one flat
  // tone, so the knockout keys BOTH and then clears the background trapped
  // between the figure's legs, which a border flood can't reach.
  // No blob — the cover card is its own solid ground.
  deeplyreader: {
    blob: true,
    layers: [
      {
        src: "/assets/projects/deeplyreader/reader.png",
        name: "drreader",
        breaksFrame: false,
      },
    ],
  },

  signaturestyle: {
    blob: true,
    layers: [
      {
        src: "/assets/projects/signaturestyle/poster.png",
        name: "ssgarments",
        breaksFrame: false,
      },
    ],
  },

  "create-space-collective": {
    blob: true,
    layers: [
      {
        src: "/assets/projects/create-space-collective/main.png",
        name: "csmain",
        breaksFrame: false,
      },
      // Vector, not baked into the artwork, so the marks can be moved or
      // dropped without a re-export.
      {
        src: "/assets/projects/create-space-collective/marks.svg",
        name: "csmarks",
        breaksFrame: false,
      },
    ],
  },
};

export function getPoster(slug: string): Poster | undefined {
  return POSTERS[slug];
}
