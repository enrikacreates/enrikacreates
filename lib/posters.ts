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
  /**
   * A single finished poster, already 4:5 and already carrying its own ground,
   * colour field and browser window. When set it is the whole artwork: the
   * blob, the drawn frame and the layer stage are all skipped, because the
   * generated image contains all three.
   */
  flat?: string;
  /** The poster's own flat background colour. See FLAT_POSTER_BG. */
  bg?: string;
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

/**
 * Projects whose artwork is a single finished 4:5 poster rather than a stack of
 * transparent layers.
 *
 * The layered system exists because a flattened rectangle can't give one
 * element prominence over another: the hierarchy had to be built in CSS. These
 * posters are generated with that hierarchy already in them, and they carry
 * their own ground, their own colour field and their own browser window. So
 * everything the layered path adds (the blob, the drawn frame, the per-tier
 * scale) would be drawn a second time on top of art that already has it.
 *
 * To add one: generate at 4:5, save it as `public/assets/posters/<slug>.png`,
 * and add the slug here. Nothing else. The file name is the wiring.
 */
/**
 * Each poster's own background colour, so a page can be the same colour as the
 * artwork sitting on it rather than a tint derived from the project's card
 * colour. Matching exactly is what makes a banner read as part of the page
 * instead of a band laid over it, and it does that without softening an edge.
 *
 * Measured, not eyeballed: the mean of the top 4.5% of each PNG, which is flat
 * field in all of them. Median per-pixel deviation came out 2-4 and the 95th
 * percentile 5-11, so these are the real colours and not an average of two.
 * Re-measure when a poster is replaced; the paper grain means picking a single
 * pixel is not good enough.
 */
const FLAT_POSTER_BG: Record<string, string> = {
  storyrepublic: "#484E30",
  storeit: "#D16A42",
  workshopblocks: "#E7BC58",
  "what-is-love": "#477F61",
  visionmap: "#7B997D",
  bernadettejiwa: "#F6ABA8",
  "goldcoast-law": "#F2D592",
  "create-space-collective": "#FBBCA6",
  signaturestyle: "#FDB8A1",
  "50-states-of-freedom": "#AEC0A1",
  deeplyreader: "#EECB86",
  hummingbird: "#FBB6A0",
  betterstories: "#87BBD9",
  "bti-production-hub": "#EFC77C",
  "the-daily-story": "#F3CC80",
  thestoryoftelling: "#94B8AD",
};

const FLAT_POSTERS = new Set([
  "storyrepublic",
  "storeit",
  "workshopblocks",
  "what-is-love",
  "visionmap",
  "bernadettejiwa",
  "goldcoast-law",
  "create-space-collective",
  "signaturestyle",
  "50-states-of-freedom",
  "deeplyreader",
  "hummingbird",
  "betterstories",
  // Artwork is in, but these three have no project document in Sanity yet, so
  // nothing renders for them: the home grid lists projects and asks each one
  // for a poster, not the other way round. They light up the moment the
  // documents exist.
  "bti-production-hub",
  "the-daily-story",
  "thestoryoftelling",
]);

/**
 * Projects whose card carries a live, scrollable screenshot.
 *
 * Baking the screen into the poster PNG makes a still; layering it in the DOM
 * makes something that can move. The still and the layer look identical at
 * rest, because the layer uses the same geometry the compositor used, so this
 * costs nothing visually and buys the hover scroll.
 *
 * `top` and `width` are fractions of the poster, matching --screen-top and
 * --screen-width. Tune per project: the right spot depends on where that
 * poster's hero object sits.
 *
 * The screenshot wants to be a FULL PAGE capture, not a viewport one. A
 * viewport-height image has nothing to scroll.
 */
/**
 * A real screenshot seated into a poster, in place of the illustrated screen.
 *
 * `ratio` is the capture's own height / width, measured not guessed, because
 * it is what decides how far the shot can travel inside its window on hover.
 * `travel` is how much of that available scroll to actually use: short of 1,
 * deliberately, so the card shows real work in motion without spending the
 * whole page. What is left unseen is the reason to click.
 */
export type Screen = {
  src: string;
  /** Top of the window, as a share of the plate's height. Defaults to the
   *  shared SCREEN_TOP; set only when a card genuinely must differ. */
  top?: number;
  /** Window width, as a share of the card's width. */
  width: number;
  /** Capture height / width. Read from the size manifest; set here only to
   *  override a measurement. */
  ratio?: number;
  /** Share of the available overflow to scroll through on hover. */
  travel?: number;
};

import SIZES from "./screen-sizes.json";

/* Where the window sits when it is OPEN: the top of the plate, so the screen
 * covers the poster entirely. The artwork does the attracting at rest and the
 * product does the convincing once someone is actually looking -- a clean
 * division of labour, rather than both being half visible at once.
 *
 * At rest the window is pushed back down by --screen-lift, so this is not
 * where the screen appears on an untouched card.
 *
 * One value for every card, so the row reads as a set rather than as screens
 * sliding about at different depths. Tuning one card's top is a real
 * temptation and it shows immediately: a straight edge across the grid is
 * worth more than a few pixels on one card. */
const SCREEN_TOP = 0;

const SCREENS: Record<string, Screen> = {
  "the-daily-story": {
    src: "/assets/projects/thedailystory/shots/fullpage.webp",
    width: 0.9,
  },
  hummingbird: {
    src: "/assets/projects/hummingbird/shots/fullpage.webp",
    /* A phone, not a browser. The capture is the app's own shell cropped out
       of a desktop backdrop, so seating it at the usual 0.9 would stretch a
       420px-wide screen across the whole card. */
    width: 0.42,
  },
  "what-is-love": {
    src: "/assets/projects/whatislovebook/shots/fullpage.webp",
    width: 0.9,
  },
  betterstories: {
    src: "/assets/projects/betterstories/shots/fullpage.webp",
    width: 0.9,
  },
  "goldcoast-law": {
    src: "/assets/projects/goldcoast-law/shots/fullpage.webp",
    width: 0.9,
  },
  bernadettejiwa: {
    src: "/assets/projects/bernadettejiwa/shots/fullpage.webp",
    width: 0.9,
  },
  visionmap: {
    /* The signed-in map, not the landing. The landing is a signup form, which
       is the least interesting thing about the project. */
    src: "/assets/projects/visionmap/shots/fullpage.webp",
    width: 0.9,
  },
  deeplyreader: {
    src: "/assets/projects/deeplyreader/shots/fullpage.webp",
    width: 0.9,
  },
  thestoryoftelling: {
    src: "/assets/projects/thestoryoftelling/shots/fullpage.webp",
    width: 0.9,
  },
  workshopblocks: {
    src: "/assets/projects/workshopblocks/shots/fullpage.webp",
    width: 0.9,
  },
  storeit: {
    src: "/assets/projects/storeit/shots/fullpage.webp",
    width: 0.9,
  },
  storyrepublic: {
    src: "/assets/projects/storyrepublic/shots/fullpage.webp",
    width: 0.9,
  },
  "bti-production-hub": {
    src: "/assets/projects/bti-production-hub/shots/fullpage.webp",
    width: 0.9,
  },
  "50-states-of-freedom": {
    src: "/assets/projects/50-states-of-freedom/shots/fullpage.webp",
    width: 0.9,
  },
  signaturestyle: {
    src: "/assets/projects/signaturestyle/shots/fullpage.webp",
    width: 0.9,
  },
  "create-space-collective": {
    src: "/assets/projects/create-space-collective/shots/fullpage.webp",
    width: 0.9,
  },
};
export function getScreen(
  slug: string
): (Screen & { top: number; ratio: number }) | undefined {
  const screen = SCREENS[slug];
  if (!screen) return undefined;
  const measured: number[] | undefined = (SIZES as Record<string, number[]>)[screen.src];
  const ratio =
    screen.ratio ??
    (measured && measured[0] > 0 ? measured[1] / measured[0] : undefined);
  /* No measurement and no override means the capture was never run through the
   * shots script, so how far it can travel is unknown. Rendering it with a
   * guessed ratio would scroll it to the wrong place; leaving the screen off
   * falls back to the artwork, which is correct if plainer. */
  if (!ratio) return undefined;
  return { ...screen, top: screen.top ?? SCREEN_TOP, ratio };
}

/**
 * @param withScreen whether a real screenshot will be layered on top. Only the
 *   card does that; a case page's banner is a wide crop of a 4:5 poster, and a
 *   screen seated for the card's proportions lands across it as a stray strip
 *   of browser chrome. The banner gets the artwork whole.
 */
export function getPoster(slug: string, withScreen = false): Poster | undefined {
  if (FLAT_POSTERS.has(slug)) {
    return {
      blob: false,
      frame: false,
      // A layered screen renders the untouched artwork and positions the
      // screenshot over it; without this the baked screen would show through
      // underneath the layer, doubled.
      flat:
        withScreen && SCREENS[slug]
          ? `/assets/posters/${slug}-art.png`
          : `/assets/posters/${slug}.png`,
      bg: FLAT_POSTER_BG[slug],
      layers: [],
    };
  }
  return POSTERS[slug];
}
