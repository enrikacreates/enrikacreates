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
    baseUrl: "https://betterstories.tech",
    routes: [
      { name: "home", path: "/" },
    ],
  },

  {
    slug: "50-states-of-freedom",
    baseUrl: "https://50-states-of-freedom.vercel.app",
    routes: [
      { name: "home", path: "/" },
    ],
  },

  {
    slug: "bernadettejiwa",
    baseUrl: "https://bernadettejiwa.vercel.app",
    routes: [
      { name: "home", path: "/" },
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
      { name: "landing", path: "/" },
      { name: "our-story", path: "/our-story" },
      { name: "values", path: "/values" },
      { name: "studio", path: "/studio" },
      { name: "celebrate", path: "/celebrate" },

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
    routes: [{ name: "home", path: "/" }],
  },

  {
    slug: "deeplyreader",
    baseUrl: "http://localhost:5188",
    routes: [{ name: "home", path: "/" }],
  },

  {
    slug: "thedailystory",
    baseUrl: "http://localhost:5190",
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
      { name: "flow3-focus", path: "/today", auth: "member", wait: 1500 },
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
      {
        name: "crop-flowup",
        path: "/today",
        auth: "member",
        clipTo: "text:ACTIONS",
        clipMin: 700,
        pad: 20,
        wait: 1500,
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
    baseUrl: "http://localhost:3230",
    routes: [{ name: "home", path: "/" }],
  },

  {
    slug: "caashflow",
    baseUrl: "http://localhost:3220",
    routes: [{ name: "home", path: "/" }],
  },

  {
    slug: "hummingbird",
    baseUrl: "http://localhost:8082",
    routes: [{ name: "home", path: "/" }],
  },

  {
    slug: "workshopblocks",
    baseUrl: "http://localhost:5173",
    routes: [
      { name: "login", path: "/" },
      { name: "builder", path: "/workshops/new", auth: "needs a signed-in user" },
    ],
  },

  {
    slug: "signaturestyle",
    baseUrl: "http://localhost:5174",
    routes: [{ name: "home", path: "/" }],
  },

  {
    slug: "visionmap",
    baseUrl: "http://localhost:3001",
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
