/**
 * What `npm run shots` captures.
 *
 * One entry per project, keyed by the project's Sanity slug so screenshots land
 * in that project's folder. Edit this file rather than the script.
 *
 * `baseUrl`   where the app is served. A localhost URL means the dev server for
 *             that app has to be running before you capture; the script says so
 *             rather than saving a connection-refused page.
 * `routes`    paths to visit. `name` becomes the filename, so keep it short and
 *             stable: a renamed route orphans the old screenshot instead of
 *             replacing it.
 * `wait`      optional extra milliseconds after network idle, for anything that
 *             animates in. Scroll-driven work needs this.
 * `auth`      optional note. A gated route captures the login screen, which is
 *             usually not what you want; the script warns before visiting one.
 */

export const PROJECTS = [
  {
    slug: "betterstories",
    /* Not betterstories.tech: that domain has no DNS record at all, and
       betterstories.vercel.app is a different product by someone else. */
    baseUrl: "https://betterstories-one.vercel.app",
    routes: [
      { name: "home", path: "/" },
    ],
  },

  {
    /* posterTop: the page opens with a red nav bar and then 90px of dead
       cream before the headline, which on a card reads as the composition
       having fallen down the frame. Starting at the eyebrow rule lets the
       headline and the portrait lead. The poster already draws a browser
       window around the screen, so the nav is not carrying that job. */
    slug: "50-states-of-freedom",
    baseUrl: "https://50-states-of-freedom.vercel.app",
    routes: [
      { name: "home", path: "/", posterTop: 0 },
    ],
  },

  {
    // Paid client work, both live on their real domains. Public, so these need
    // no signed-in profile.
    slug: "bernadettejiwa",
    baseUrl: "https://bernadettejiwa.com",
    routes: [
      { name: "home", path: "/", wait: 1400 },
      { name: "search", path: "/search", wait: 1200 },
    ],
  },

  {
    // The two routes that ARE the case study: /es is the Spanish version the
    // AI first pass paid for, /accessibility is the statement behind the
    // accessibility claim. Capturing the home page alone would illustrate
    // neither.
    slug: "goldcoast-law",
    baseUrl: "https://goldcoastlaw.com",
    routes: [
      { name: "home", path: "/", wait: 1600 },
      { name: "es", path: "/es", wait: 1600 },
      { name: "accessibility", path: "/accessibility", wait: 1200 },
      { name: "areas-of-practice", path: "/areas-of-practice", wait: 1400 },
    ],
  },

  {
    // Renders client-side, so nothing useful comes back from a plain fetch;
    // the capture runs a real browser, which is the point.
    slug: "visionmap",
    baseUrl: "https://visionmap.coach",
    routes: [
      { name: "home", path: "/", wait: 2200 },
    ],
  },

  {
    slug: "thestoryoftelling",
    baseUrl: "https://thestoryoftelling.com",
    routes: [
      { name: "home", path: "/", wait: 1400 },
      { name: "blog", path: "/blog", wait: 1600 },
      { name: "about", path: "/about", wait: 1200 },
      { name: "books", path: "/books", wait: 1200 },
      { name: "search", path: "/search", wait: 1200 },
    ],
  },

  {
    // One static page, hash routed, so the whole thing is one capture plus a
    // couple of sections scrolled into view.
    slug: "whatislovebook",
    baseUrl: "https://whatislovebook.org",
    routes: [
      /* wait: the HEAR MORE section is three Vimeo players, and a player
         paints black until it has fetched its own thumbnail. Too short a wait
         photographs three black squares in the middle of the page, which the
         card's hover then scrolls straight through. */
      { name: "home", path: "/", wait: 3000, poster: true, embedThumbnails: true },
      // Sections are addressed by id, not by a heading string: the page is one
      // document with hash routing, so a text match lands nowhere useful.
      { name: "authors", path: "/", scrollTo: "#authors", wait: 1600 },
      { name: "supporters", path: "/", scrollTo: "#earlysupporters-section", wait: 1600 },
    ],
  },

  {
    // Client work, and the only app here whose infrastructure lives in the
    // client's own accounts: there is no local env that connects, so this one
    // is captured against production. Everything in it is the team's test
    // data; nothing real had been scheduled through it yet.
    slug: "bti-production-hub",
    baseUrl: "https://btistudio.app",
    routes: [
      { name: "flow1-login", path: "/login", wait: 900 },
      // Where it started: a single request form, before any of the rest existed.
      { name: "flow2-request", path: "/requests/new", wait: 1200 },
      {
        name: "flow3-board",
        path: "/board",
        auth: "member",
        wait: 1500,
        expect: "Production pipeline",
        poster: true,
        /* A real client's project names and staff names. The system is the
           story; whose videos they are is not ours to publish. */
        blur: [
          // Scoped to the cards. An unscoped "every muted paragraph" also
          // caught the page's own subtitle, and an adjacent-sibling rule
          // matched nothing at all and left every name crisp -- which is the
          // failure that matters, so this errs wide inside the cards and
          // leaves everything outside them alone.
          'article h3[class*="text-navy"]',
          'article p[class*="text-muted-2"]',
          'article span[class*="bg-quiet"]',
        ],
      },
      { name: "flow4-calendar", path: "/calendar", auth: "member", wait: 1500 },
      { name: "flow5-capacity", path: "/capacity", auth: "member", wait: 1500 },
      { name: "flow6-tasks", path: "/tasks", auth: "member", wait: 1200 },
      { name: "flow7-team", path: "/team", auth: "member", wait: 1200 },
      { name: "flow8-notes", path: "/notes", auth: "member", wait: 1200 },
    ],
  },

  /* ---- Local only. Start each app's dev server first. ----
     Ports match .claude/launch.json in ~/dev, so `preview_start <name>` and
     this config can't drift apart. Routes marked `auth` redirect to the login
     screen when nobody is signed in: the script captures what it is served,
     so an unauthenticated run of those produces a folder of login pages. */

  {
    slug: "create-space-collective",
    baseUrl: "http://localhost:3210",
    routes: [
      { name: "landing", path: "/", poster: true, loggedOut: true },
      { name: "our-story", path: "/our-story" },
      { name: "values", path: "/values" },
      { name: "studio", path: "/studio" },
      { name: "celebrate", path: "/celebrate" },

      /* Candidates for the card screen, compared with --poster --all and then
         left here so the comparison can be re-run when the app changes.
         Member-side: the capture profile is signed in to this one. */
      /* --- Detail-view screens for the case study --- */
      { name: "challenges", path: "/challenges", auth: "member", wait: 1800 },
      { name: "whats-on", path: "/whats-on", auth: "member", wait: 1500 },
      /* The member feed: real people's posts, real photographs, comments.
         Compared against the landing for the card and lost on the strength of
         the landing's hero, but it is the screen that shows the product with
         people actually in it, which is what a case study is for. */
      { name: "living-room", path: "/living-room", auth: "member", wait: 1800 },
      /* A real member's body of work, not the owner's. Hard-coded id because
         the point is this particular page: a real photograph of real people
         and a real collection, which is what the empty walls cannot show. */
      {
        name: "member-work",
        path: "/u/60043191-c1f1-4795-9a1e-b25a9363dfd6/work",
        auth: "member",
        wait: 1800,
      },
      { name: "library", path: "/library", posterOnly: true, wait: 1800 },
      { name: "paths", path: "/paths", posterOnly: true, wait: 1800 },
      { name: "make-space", path: "/make-space", posterOnly: true, wait: 1800 },
      
      { name: "show-and-tell", path: "/show-and-tell", posterOnly: true, wait: 1800 },
      { name: "made-it-wall", path: "/made-it-wall", posterOnly: true, wait: 1800 },
      { name: "pods", path: "/pods", posterOnly: true, wait: 1800 },

      /* --- Onboarding flow: login, welcome, dashboard, profile nudge --- */
      { name: "flow1-login", path: "/login" },
      // Admin-only preview that forces the welcome open without consuming the
      // member's real first-run flag. Built into the app for exactly this.
      { name: "flow2-welcome", path: "/home?welcome=preview", auth: "admin", wait: 900 },
      /* Both /home routes go in through ?welcome=preview first. Loading /home
         cold in a fresh capture profile opens the first-run welcome, and that
         modal pings the welcome committee on OPEN — it put 8 real "say hi"
         notifications in front of a member before this was understood. Preview
         mode skips the ping; setting the seen-flag then keeps the modal shut
         so what's behind it can be photographed. */
      {
        name: "flow3-dashboard",
        path: "/home",
        visitFirst: "/home?welcome=preview",
        set: { cs_welcomed_v1: "1" },
        auth: "member",
        wait: 600,
      },
      // The nudge hides itself for the rest of the session once dismissed, and
      // is hidden entirely at 100% profile completion.
      {
        name: "flow4-profile-nudge",
        path: "/home",
        visitFirst: "/home?welcome=preview",
        set: { cs_welcomed_v1: "1" },
        clear: ["cs-profile-nudge"],
        auth: "member",
        wait: 900,
      },

      /* --- Day to day: join a challenge, then the weekly loop --- */
      // The member's own controls: interests, match-ups, how quiet they want
      // the space, and which voice reads things aloud to them.
      { name: "flow4b-account", path: "/account", auth: "member", wait: 1600 },
      // The controls themselves sit well down the page, so scroll to them.
      {
        name: "flow4c-terms",
        path: "/account",
        auth: "member",
        scrollTo: "text:READER VOICE",
        wait: 1400,
      },
      /* --- Tight crops, for showing the design rather than the page ---
         A calm app photographs as mostly empty ground at viewport size. These
         frame one component each. */
      {
        name: "crop-welcome",
        path: "/home?welcome=preview",
        auth: "admin",
        clipTo: "text:Welcome to Create Space",
        clipMin: 380,
        pad: 36,
        wait: 1500,
      },
      {
        name: "crop-wheretonext",
        path: "/home",
        visitFirst: "/home?welcome=preview",
        set: { cs_welcomed_v1: "1" },
        auth: "member",
        clipTo: "text:Where to next",
        clipMin: 420,
        pad: 36,
        wait: 1200,
      },
      {
        name: "crop-checkin",
        path: "/living-room",
        auth: "member",
        clipTo: "text:Weekly check-in",
        clipMin: 420,
        pad: 32,
        wait: 1200,
      },
      {
        name: "crop-personal-challenges",
        path: "/challenges",
        auth: "member",
        clipTo: "text:Personal challenges",
        clipMin: 460,
        pad: 32,
        wait: 1200,
      },
      { name: "flow5-challenges", path: "/challenges", auth: "member" },
      { name: "flow6-check-in", path: "/living-room", auth: "member" },
      { name: "flow7-ship", path: "/made-it-wall", auth: "member" },
      { name: "flow8-support", path: "/show-and-tell", auth: "member" },
    ],
  },

  {
    slug: "crushit",
    baseUrl: "http://localhost:5175",
    /* `/` redirects to the last realm used, so the realm pages are the real
     * surfaces. The landing opens on a video, which a still capture can only
     * photograph one arbitrary frame of, so it is not a poster candidate. */
    routes: [{ name: "home", path: "/" }],
  },

  {
    slug: "deeplyreader",
    baseUrl: "http://localhost:5188",
    /* `/` redirects to the last realm used, so the realm pages are the real
     * surfaces. The landing opens on a video, which a still capture can only
     * photograph one arbitrary frame of, so it is not a poster candidate. */
    routes: [{ name: "home", path: "/" }],
  },

  {
    slug: "thedailystory",
    // The live app, not a dev server. Captures kept photographing an empty
    // product: even flow3b-busy-day, pointed at the one day chosen for scoring
    // 67, came out +0 PTS with the panel still saying "Loading...". Capturing
    // production means the data is whatever is really there, and there is no
    // dev server to have forgotten to start.
    baseUrl: "https://thedailystory.app",
    // Vite SPA, so routing is client side: give each route a beat to render
    // after the shell loads or the capture catches an empty frame.
    routes: [
      { name: "flow1-login", path: "/login", wait: 700 },
      // The five step onboarding: Identity, Narrative, Vision, Vibes, VIPs.
      // Redirects to /today once it has been completed, so on a real account
      // this captures the destination rather than the steps.
      { name: "flow2-setup", path: "/map", auth: "member", wait: 1200 },
      // Flow Up is a six tier coaching ladder sized against the day's planned
      // actions: Ready, Spark, Momentum, In the flow, Almost peak, Peak flow.
      // The copy changes with the tier, which a single screenshot cannot show,
      // so the same URL is captured twice at different points in a real day.
      { name: "flow3-focus", path: "/today", auth: "member", wait: 1500, poster: true },
      { name: "flow3e-momentum", path: "/today", auth: "member", wait: 1500 },
      // The app is date addressable, which matters for capture: "today" is
      // whatever today happens to be, and a rest day photographs as an empty
      // product. 2026-07-14 scored 67 against a next best of 16, so it is the
      // day that actually shows the mechanic carrying a full load.
      { name: "flow3b-busy-day", path: "/day/2026-07-14", auth: "member", wait: 1800 },
      { name: "flow3c-week", path: "/week/2026-07-14", auth: "member", wait: 1800 },

      /* --- Tight crops: the full-screen overlays sit in a lot of empty
         ground at viewport size, which shows the page rather than the work. */
      {
        name: "crop-board",
        path: "/today",
        auth: "member",
        click: ['[aria-label="Switch view"]', "text:Board"],
        clipTo: "text:BUCKET LIST",
        clipMin: 900,
        pad: 24,
        // The board centres its columns, so a wide frame is mostly the dimmed
        // page behind the overlay. Narrow until the columns fill it.
        vw: 900,
        wait: 1800,
      },
      {
        name: "crop-write",
        path: "/today",
        auth: "member",
        click: ['[aria-label="Switch view"]', "text:Write"],
        clipTo: "text:COACHING",
        clipMin: 700,
        pad: 28,
        wait: 1800,
      },
      // Two tiers of the same bar. The copy changes with how full the day is,
      // which one screenshot cannot show and two full-page shots hide, since
      // the bar is a sliver at the top of each.
      {
        name: "crop-flowup-now",
        path: "/today",
        auth: "member",
        clipTo: "text:ACTIONS",
        clipMin: 700,
        pad: 18,
        wait: 1500,
      },
      {
        name: "crop-flowup-busy",
        path: "/day/2026-07-14",
        auth: "member",
        clipTo: "text:ACTIONS",
        clipMin: 700,
        pad: 18,
        wait: 1800,
      },
      // The feedback step of the daily loop. NOT the Stats mode: the score
      // breakdown opens in place on the day you are already looking at, which
      // is why it is the one that actually gets used.
      {
        name: "flow3d-score",
        path: "/day/2026-07-14",
        auth: "member",
        click: ['button[title^="See what earned"]'],
        wait: 1400,
      },
      // The north star page itself. Distinct from Vision MODE below, which is
      // the dashboard with focus switched off.
      { name: "flow4-northstar", path: "/vision", auth: "member", wait: 1200 },
      { name: "flow5-projects", path: "/projects", auth: "member", wait: 1200 },
      { name: "flow6-goals", path: "/goals", auth: "member", wait: 1200 },

      /* --- The Dailies: the recurring track ---
         Distinct from the funnel. Actions and projects get promoted and then
         they are done; these reset. Keeping the two apart is the design, which
         is why they are captured as their own set. */
      {
        name: "daily1-story",
        path: "/today",
        auth: "member",
        click: ["text:Daily Story"],
        wait: 1200,
      },
      {
        name: "daily2-vision",
        path: "/today",
        auth: "member",
        click: ["text:Daily Vision"],
        wait: 1200,
      },
      // Time of day buckets: Morning, Day, Evening, Night.
      {
        name: "daily3-dos",
        path: "/today",
        auth: "member",
        click: ["text:Daily Do"],
        wait: 1200,
      },
      // Category buckets: Move, Play, Nourish, Clean, Be, Create. The same six
      // that the scores table keeps columns for.
      {
        name: "daily4-dos-details",
        path: "/today",
        auth: "member",
        click: ["text:Daily Do", "text:Details"],
        wait: 1400,
      },

      /* --- The five modes, reached through the eye switcher ---
         Board, Write and Stats are transient UI state by design, so there is
         no URL for them: the capture opens the switcher and presses the mode,
         exactly as a person would. */
      { name: "mode1-focus", path: "/today", auth: "member", wait: 1500 },
      {
        name: "mode2-vision",
        path: "/today",
        auth: "member",
        click: ['[aria-label="Switch view"]', "text:Vision"],
        wait: 1500,
      },
      {
        name: "mode3-board",
        path: "/today",
        auth: "member",
        click: ['[aria-label="Switch view"]', "text:Board"],
        wait: 1800,
      },
      {
        name: "mode4-write",
        path: "/today",
        auth: "member",
        click: ['[aria-label="Switch view"]', "text:Write"],
        wait: 1800,
      },
      {
        name: "mode5-stats",
        path: "/today",
        auth: "member",
        click: ['[aria-label="Switch view"]', "text:Stats"],
        wait: 1800,
      },
      // Stats follows the active date context, so opened from today it shows a
      // month that has barely started. Opened from the busy day it shows the
      // month the mechanic actually ran in.
      {
        name: "mode5b-stats-july",
        path: "/day/2026-07-14",
        auth: "member",
        click: ['[aria-label="Switch view"]', "text:Stats"],
        wait: 2000,
      },
    ],
  },

  {
    slug: "storeit",
    baseUrl: "https://store-it-murex.vercel.app",
    /* `/` redirects to the last realm used, so the realm pages are the real
     * surfaces. The landing opens on a video, which a still capture can only
     * photograph one arbitrary frame of, so it is not a poster candidate. */
    routes: [
      /* "Store it. Find it." appears on the signed-OUT page too, so the
         expectation is a section that only exists once there is something to
         show. */
      {
        name: "home",
        path: "/",
        auth: "member",
        wait: 2000,
        expect: ["Categories", "Spaces"],
        poster: true,
      },
    ],
  },

  {
    slug: "caashflow",
    baseUrl: "http://localhost:3220",
    /* `/` redirects to the last realm used, so the realm pages are the real
     * surfaces. The landing opens on a video, which a still capture can only
     * photograph one arbitrary frame of, so it is not a poster candidate. */
    routes: [{ name: "home", path: "/" }],
  },

  {
    slug: "hummingbird",
    baseUrl: "http://localhost:8082",
    routes: [
      { name: "songbook", path: "/", auth: "member", expect: ["Songbook", "Ridgeline"] },
      /* The song itself, on its Vibe tab: cover artwork, and the tracks this
         one is reaching for. Not addressable by URL -- the songbook is the
         only way in -- so it is reached the way a person reaches it, by
         pressing the song and then the tab.

         posterShell/posterHeight: Expo web scrolls inside a shell, so the
         document is one viewport tall however much is in it and the phone is
         a fifth of a desktop frame wide. A tall viewport lets the app lay
         itself out long on its own terms; the shell is measured, not touched.
         posterScale 2 because a 420px column needs the density. */
      {
        name: "vibe",
        path: "/",
        auth: "member",
        expect: ["Ridgeline"],
        click: ["text:Ridgeline", "text:VIBE"],
        clickWait: 1400,
        poster: true,
        posterShell: true,
        posterHeight: 2200,
        posterScale: 2,
      },
    ],
  },

  {
    slug: "workshopblocks",
    baseUrl: "https://workshopblocks.vercel.app",
    routes: [
      /* /library, not the dashboard at /: the wall of colour-coded blocks is
         the product, and it is a long grid, which is what the card's hover
         wants. "Block Library" only renders once signed in, so the expectation
         also catches a capture that quietly landed on the sign-in form. */
      {
        name: "library",
        path: "/library",
        auth: "member",
        wait: 2000,
        expect: "Block Library",
        poster: true,
      },
    ],
  },

  {
    slug: "signaturestyle",
    baseUrl: "http://localhost:5174",
    /* `/` redirects to the last realm used, so the realm pages are the real
     * surfaces. The landing opens on a video, which a still capture can only
     * photograph one arbitrary frame of, so it is not a poster candidate. */
    routes: [
      { name: "home", path: "/", auth: "member", wait: 2000 },
      /* The two states worth showing fight each other by scroll: the masthead
         is full size only at scrollY === 0, the photo clusters bloom only past
         30. So rest at the top for the masthead and open the clusters by
         parking the cursor on one, which blooms all of them. */
      {
        name: "wardrobe",
        path: "/wardrobe",
        auth: "member",
        wait: 2000,
        expect: "Your Inspo",
        poster: true,
        posterScroll: 0,
        posterHover: 'div[class*="aspect-"] img',
        posterHoverPark: true,
      },
      { name: "styles", path: "/wardrobe/styles", auth: "member", wait: 2000 },
      { name: "closet", path: "/wardrobe/items", auth: "member", wait: 2000 },
      { name: "outfits", path: "/wardrobe/outfits", auth: "member", wait: 2000 },
      { name: "lookbooks", path: "/wardrobe/lookbooks", auth: "member", wait: 2000 },
      { name: "capsule", path: "/wardrobe/capsule", auth: "member", wait: 2000 },
    ],
  },

  {
    slug: "visionmap",
    baseUrl: "http://localhost:3001",
    /* `/` redirects to the last realm used, so the realm pages are the real
     * surfaces. The landing opens on a video, which a still capture can only
     * photograph one arbitrary frame of, so it is not a poster candidate. */
    routes: [{ name: "home", path: "/" }],
  },
];

/**
 * Phone and desktop. Both are captured for every route, because the portfolio
 * claims phone-first work and a desktop-only screenshot doesn't evidence it.
 */
export const VIEWPORTS = [
  { label: "375", width: 375, height: 812, mobile: true },
  { label: "1440", width: 1440, height: 900, mobile: false },
];
