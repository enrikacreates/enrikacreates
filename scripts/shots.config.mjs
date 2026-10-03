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
    routes: [{ name: "home", path: "/" }],
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
