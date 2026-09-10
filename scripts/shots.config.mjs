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

  /* ---- Local only. Start each app's dev server first. ---- */

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
