/**
 * Capture app screenshots for project case studies.
 *
 *   npm run shots                      every project in shots.config.mjs
 *   npm run shots -- --project 50-states-of-freedom
 *   npm run shots -- --route challenges,living-room   just these routes
 *   npm run shots -- --full            full-page instead of one viewport
 *   npm run shots -- --poster          one tall capture per app for the card screens
 *   npm run shots -- --poster --pick   same, but you choose the moment to fire
 *   npm run shots -- --poster --all    every route, to compare before choosing
 *   npm run shots -- --list            print what would be captured, visit nothing
 *   npm run shots -- --login           open a window to sign in; captures nothing
 *
 * Auth: routes marked `auth` in the config need a signed-in session. Run with
 * --login once per app, sign in by hand, then press Enter in the terminal; the
 * session is kept in .shots-profile/ and every later run reuses it.
 *
 * Writes to public/assets/projects/<slug>/shots/<route>-<width>.png, then you
 * upload the ones worth keeping into a project's process steps in the Studio.
 * Deliberately not automatic: the value of a screenshot in a case study is the
 * caption next to it, and that is a judgement call.
 *
 * Uses puppeteer-core against the Chrome already installed on this machine, so
 * there is no bundled browser to download or keep current.
 */

import puppeteer from "puppeteer-core";
import sharp from "sharp";
import { mkdir, access, unlink, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { PROJECTS, VIEWPORTS } from "./shots.config.mjs";

/* ---------- Chrome ---------- */

const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
];

function findChrome() {
  const found = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!found) {
    console.error(
      "✗ No Chrome found. Install Google Chrome, or add its path to\n" +
        "  CHROME_CANDIDATES in scripts/shots.mjs."
    );
    process.exit(1);
  }
  return found;
}

/* ---------- args ---------- */

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const value = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 ? argv[i + 1] : undefined;
};

const only = value("project");
/* Capturing one app means capturing all ~25 of its routes at both viewports.
 * Usually only a handful have changed, or are wanted. */
const onlyRoutes = value("route")?.split(",").map((r) => r.trim()).filter(Boolean);
const fullPage = flag("full");
const listOnly = flag("list");
const loginMode = flag("login");
const posterMode = flag("poster");
const pickMode = flag("pick");
const allMode = flag("all");

/* ---------- poster screens ---------- */

/* The capture that gets seated into a project card and scrolls on hover.
 *
 * One fixed width for every app, because the cards sit next to each other and
 * a capture taken at a different width shows its content at a different scale,
 * which reads as a mismatched set. 1100 is wide enough to be clear of the
 * common 1024 breakpoint, so apps lay out as desktop rather than squeezed
 * tablet, and narrow enough that the content is still legible once the card
 * shows it ~250px wide.
 *
 * Captured at 2x and downsampled to 1100, which is sharper than grabbing 1100
 * directly, then written as webp: these are decoration on a grid of cards, and
 * the png of the first one was 795KB against 121KB for the same pixels.
 */
const POSTER = {
  width: 1100,
  height: 900,
  /* 1x, not retina. The card shows this ~254 CSS px wide, so 1100 is already
   * a 2x downsample on a retina display; capturing at 2x doubles the file and
   * the headful window for no visible gain. */
  scale: 1,
  /* How tall the page should be, as a multiple of its width. Under this and
   * there is barely anything to reveal on hover; over it and the three-second
   * scroll turns into a skim. Advisory only, it never blocks a capture. */
  ratio: { min: 2.2, max: 4.3 },
};
const POSTER_VP = {
  label: "poster",
  width: POSTER.width,
  height: POSTER.height,
  mobile: false,
};

const viewports = posterMode ? [POSTER_VP] : VIEWPORTS;

/** The one route worth seating in a card: `poster: true` in the config, else
 *  the first one, which is the app's front door often enough to be a default. */
const posterRoute = (project) =>
  project.routes.find((r) => r.poster) ?? project.routes[0];

/* `--all` captures every route at poster size instead of the one marked, so a
 * set can be compared side by side before anything is wired into a card. Which
 * screen sells an app is a judgement made by looking, not by reasoning about
 * route names. */
const routesFor = (project) => {
  if (onlyRoutes) return project.routes.filter((r) => onlyRoutes.includes(r.name));
  if (posterMode) return allMode ? project.routes : [posterRoute(project)];
  /* Routes that exist only to be compared as card screens would otherwise
     double the length of an ordinary run for case-study shots nobody asked
     for. */
  return project.routes.filter((r) => !r.posterOnly);
};

/* A persistent Chrome profile, so a signed-in session survives between runs.
 *
 * Most of these apps put their best screens behind auth, and a throwaway
 * headless browser starts logged out every time. `--login` opens this profile
 * with a window so YOU can sign in by hand; every later run reuses the session
 * and captures the member side at full resolution.
 *
 * Deliberately NOT your everyday Chrome profile: this one only ever holds
 * sessions for the apps in this config, and nothing here reads or writes the
 * credentials themselves. Delete the directory to sign everything out. */
const PROFILE = path.resolve(".shots-profile");

const targets = only ? PROJECTS.filter((p) => p.slug === only) : PROJECTS;

if (targets.length === 0) {
  console.error(
    `✗ No project "${only}". Known: ${PROJECTS.map((p) => p.slug).join(", ")}`
  );
  process.exit(1);
}

const outDir = (slug) =>
  path.join("public", "assets", "projects", slug, "shots");

if (listOnly) {
  console.log("Would capture:\n");
  for (const p of targets) {
    console.log(`  ${p.slug}  (${p.baseUrl})  ->  ${outDir(p.slug)}/`);
    for (const r of routesFor(p)) {
      const sizes = viewports.map((v) => `${r.name}-${v.label}.png`).join("  ");
      console.log(`    ${r.path.padEnd(18)} ${sizes}${r.auth ? `   [${r.auth}]` : ""}`);
    }
  }
  process.exit(0);
}

/* ---------- is it actually up? ---------- */

/** A localhost target with nothing listening wastes a browser launch and saves
 *  an error page, so check first and say which server to start. */
async function reachable(baseUrl) {
  try {
    const res = await fetch(baseUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    return res.status < 500;
  } catch {
    return false;
  }
}

/* ---------- capture ---------- */

const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: !loginMode && !pickMode,
  userDataDir: PROFILE,
  defaultViewport: loginMode ? null : undefined,
  args: ["--hide-scrollbars", "--force-color-profile=srgb"],
});

const skippedLogins = [];

/* `--login`: open the app and wait. Nothing is captured and nothing is typed
 * for you; close the window when you're signed in to each app you want. */
if (loginMode) {
  /* A tab per app that has an auth-gated route, rather than one tab at the
   * first app's address. Signing in is the one step a script cannot do, so the
   * least it can do is not also make you type six URLs. Apps whose server is
   * down are skipped and named, because an error page in a tab looks exactly
   * like an app that failed to load. */
  const needLogin = [];
  for (const p of targets) {
    if (!p.routes.some((r) => r.auth)) continue;
    if (await reachable(p.baseUrl)) needLogin.push(p);
    else skippedLogins.push(`${p.slug}: ${p.baseUrl} not reachable`);
  }
  if (needLogin.length === 0) needLogin.push(targets[0]);

  const first = (await browser.pages())[0] ?? (await browser.newPage());
  for (const [i, p] of needLogin.entries()) {
    const page = i === 0 ? first : await browser.newPage();
    await page.goto(p.baseUrl, { waitUntil: "domcontentloaded" }).catch(() => {});
  }
  console.log(
    `\nSigning-in window open, one tab per app:\n` +
      needLogin.map((p) => `    ${p.slug.padEnd(26)} ${p.baseUrl}`).join("\n") +
      `\n\n  Sign in to each tab you want captured, then press Enter here.\n` +
      `  The session is kept in ${path.relative(process.cwd(), PROFILE)}/ and reused by later runs.\n` +
      (skippedLogins.length
        ? `\n  Not opened, server down:\n` +
          skippedLogins.map((m) => `    ${m}`).join("\n") +
          `\n`
        : "")
  );

  /* Enter, not "close the window".
   *
   * On macOS, closing Chrome's last window does NOT quit Chrome, so waiting on
   * `disconnected` hangs forever with the session still unflushed. Waiting on
   * stdin puts the end of the step somewhere that always fires, and closing the
   * browser from here is what writes the cookie jar to disk. */
  await new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.once("data", resolve);
    browser.once("disconnected", resolve);
  });

  await browser.close().catch(() => {});
  console.log("Saved. Re-run without --login to capture.");
  process.exit(0);
}

/** Wait for Enter on stdin. Used wherever the script needs a person: signing
 *  in, and choosing the moment a capture fires. */
function waitForEnter() {
  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.once("data", () => {
      process.stdin.pause();
      resolve();
    });
  });
}

let saved = 0;
const skipped = [];
const posters = [];

try {
  for (const project of targets) {
    if (!(await reachable(project.baseUrl))) {
      const local = project.baseUrl.includes("localhost");
      skipped.push(
        `${project.slug}: ${project.baseUrl} not reachable` +
          (local ? " (start that app's dev server first)" : "")
      );
      continue;
    }

    const dir = outDir(project.slug);
    await mkdir(dir, { recursive: true });
    console.log(`\n${project.slug}  ${project.baseUrl}`);

    for (const route of routesFor(project)) {
      if (route.auth) {
        console.log(`  ! ${route.path} ${route.auth} — capturing whatever renders`);
      }

      for (const vp of viewports) {
        /* A route marked `loggedOut` has to be captured as a stranger sees
         * it, and the persistent profile is signed in to most of these apps:
         * a landing page captured through it shows a member nav, or redirects
         * past the landing entirely. An isolated context starts with no
         * cookies and no storage, which is exactly a first-time visitor. */
        const context = route.loggedOut ? await browser.createBrowserContext() : null;
        const page = await (context ?? browser).newPage();
        try {
          /* A wide overlay with few columns photographs as mostly empty
           * ground. `vw` narrows the viewport for one route so its content
           * fills the frame, rather than cropping emptiness out afterwards. */
          await page.setViewport({
            width: posterMode ? vp.width : route.vw && !vp.mobile ? route.vw : vp.width,
            height: posterMode ? (route.posterHeight ?? vp.height) : vp.height,
            /* A full-width page capture at 1x is already a downsample by the
             * time a card shows it. A phone shell cropped out of one is only
             * ~420px wide, so it needs the extra density to stay sharp. */
            deviceScaleFactor: posterMode ? (route.posterScale ?? POSTER.scale) : 2,
            isMobile: vp.mobile,
            hasTouch: vp.mobile,
          });

          /* `visitFirst` lands somewhere harmless before the real route, so
           * storage can be primed without the target page rendering once in
           * its unprimed state. Needed wherever simply LOADING a page has a
           * side effect: Create Space's dashboard pings the welcome committee
           * when its first-run modal opens, so the dashboard is reached via
           * the app's own ?welcome=preview (which skips that ping), the
           * seen-flag is set, and only then is /home itself loaded. */
          const first = route.visitFirst ?? route.path;
          await page.goto(new URL(first, project.baseUrl).toString(), {
            waitUntil: "networkidle2",
            timeout: 30000,
          });

          /* Onboarding surfaces are once-ever by design: a welcome modal or a
           * profile nudge hides itself in localStorage the first time you see
           * it, which is right for members and useless for screenshots. `clear`
           * drops those keys and reloads, so the step can be captured without
           * anyone hand-resetting their account.
           *
           * `set` is the opposite and matters more: a once-ever modal in a
           * FRESH capture profile thinks every visit is a first visit, so it
           * reopens on every load. If opening it has a side effect (Create
           * Space pings the welcome committee when its welcome modal opens),
           * capturing a page behind it fires that side effect once per
           * viewport, against real data. Setting the seen-flag first is what
           * stops that, and it is also the only way to photograph what sits
           * underneath the modal.
           *
           * Done AFTER the first load because storage is origin-scoped: there
           * is nothing to clear or set until the page has been there once.
           * That first load still renders the modal, so a route whose side
           * effect must never fire needs the app's own preview mode, not
           * this. */
          if (route.clear?.length || route.set) {
            await page.evaluate(
              (keys, pairs) => {
                for (const k of keys ?? []) {
                  try { localStorage.removeItem(k); } catch {}
                  try { sessionStorage.removeItem(k); } catch {}
                }
                for (const [k, v] of Object.entries(pairs ?? {})) {
                  try { localStorage.setItem(k, v); } catch {}
                }
              },
              route.clear ?? [],
              route.set ?? {}
            );
            if (route.visitFirst) {
              await page.goto(new URL(route.path, project.baseUrl).toString(), {
                waitUntil: "networkidle2",
                timeout: 30000,
              });
            } else {
              await page.reload({ waitUntil: "networkidle2", timeout: 30000 });
            }
          }

          /* Some of the best screens are not addressable. The Daily Story's
           * modes live in a transient UI store, deliberately not persisted, so
           * there is no URL and no storage key to set: the only way in is to
           * press the thing a person presses. Each step is a CSS selector, or
           * "text:Label" to match a control by its visible text. */
          for (const step of route.click ?? []) {
            await page.evaluate((sel) => {
              const el = sel.startsWith("text:")
                ? (() => {
                    const want = sel.slice(5);
                    const all = [...document.querySelectorAll("button, a, [role=button]")];
                    // Exact first, then contains. UI labels carry curly
                    // apostrophes and stray whitespace that an exact match
                    // loses on, and failing to click is worse than clicking a
                    // slightly looser match.
                    return (
                      all.find((n) => n.textContent.trim() === want) ??
                      all.find((n) => n.textContent.trim().includes(want))
                    );
                  })()
                : document.querySelector(sel);
              if (!el) throw new Error(`nothing matched ${sel}`);
              el.click();
            }, step);
            await new Promise((r) => setTimeout(r, route.clickWait ?? 700));
          }

          /* Long settings pages keep their most interesting controls below the
           * fold, and a viewport capture of the top of one says nothing. Scroll
           * to a named thing first, by CSS selector or "text:Label". */
          if (route.scrollTo && !posterMode) {
            await page.evaluate((sel) => {
              // Case-insensitive: labels are often uppercased in CSS, so the
              // DOM text is "Reader voice" where the screen says READER VOICE.
              const want = sel.startsWith("text:") ? sel.slice(5).toLowerCase() : null;
              const el = want
                ? [...document.querySelectorAll("h1,h2,h3,h4,p,span,div,label,button")]
                    .find((n) => n.textContent.trim().toLowerCase().startsWith(want))
                : document.querySelector(sel);
              if (!el) throw new Error(`nothing to scroll to for ${sel}`);
              el.scrollIntoView({ block: "center" });
            }, route.scrollTo);
            await new Promise((r) => setTimeout(r, 500));
          }

          if (route.wait) {
            await new Promise((r) => setTimeout(r, route.wait));
          }

          /* A full viewport shot of a calm app is mostly empty ground, which
           * undersells the design rather than showing it. `clipTo` crops to one
           * component: the smallest element containing the given text that is
           * still at least `clipMin` wide, plus `pad` of breathing room. Text
           * rather than a CSS selector on purpose, because the class names here
           * are generated utility soup and would rot on the next restyle. */
          /* A poster screen is the whole page by definition, so a route's
             clipTo (which crops a case-study shot to one component) is not
             just unused here, it fails loudly on pages that redirect. */
          let clip;
          if (route.clipTo && !posterMode) {
            clip = await page.evaluate(
              (sel, min) => {
                const want = sel.replace(/^text:/, "").toLowerCase();
                const hits = [...document.querySelectorAll("div,section,article,aside")]
                  .filter((n) => n.textContent.toLowerCase().includes(want))
                  .map((n) => n.getBoundingClientRect())
                  .filter((r) => r.width >= min && r.height > 40);
                if (!hits.length) return null;
                // Smallest by area: the component, not the page that holds it.
                hits.sort((a, b) => a.width * a.height - b.width * b.height);
                const r = hits[0];
                return { x: r.x, y: r.y, width: r.width, height: r.height };
              },
              route.clipTo,
              route.clipMin ?? 280
            );
            if (!clip) throw new Error(`clipTo found nothing for ${route.clipTo}`);
            const pad = route.pad ?? 28;
            clip = {
              x: Math.max(0, clip.x - pad),
              y: Math.max(0, clip.y - pad),
              width: Math.min(vp.width - Math.max(0, clip.x - pad), clip.width + pad * 2),
              height: Math.min(vp.height - Math.max(0, clip.y - pad), clip.height + pad * 2),
            };
          }

          /* A full-page screenshot does not scroll, so anything that waits
           * for the viewport to reach it never loads: lazy images stay blank
           * and reveal-on-scroll sections stay at opacity 0. Walking down the
           * page and back up first is what makes the capture show the page a
           * person would actually see.
           *
           * Where it comes to rest matters. A page whose open state is keyed
           * to having scrolled reads a return to y=0 as "never scrolled" and
           * folds shut: SignatureStyle's photo clusters bloom at scrollY > 30
           * and explicitly re-clump at y <= 0, so the lazy-load pass was
           * closing them in the last moment before the shot. `posterScroll`
           * leaves the page resting below that line. The capture still starts
           * at the document origin, so nothing is lost off the top. */
          if (posterMode) {
            await page.evaluate(async (restY) => {
              const step = window.innerHeight * 0.8;
              for (let y = 0; y < document.body.scrollHeight; y += step) {
                window.scrollTo(0, y);
                await new Promise((r) => setTimeout(r, 120));
              }
              window.scrollTo(0, restY);
              await new Promise((r) => setTimeout(r, 600));
            }, route.posterScroll ?? 0);
          }

          /* A script can get the width, the chrome and the lazy loading right
           * every time, and cannot tell that the hero is cycling through its
           * images and this one is the dull one. `--pick` hands the page over
           * at exactly the right size with the scrollbars already hidden, so
           * the only thing left to decide is the thing only a person can:
           * when it looks right. */
          if (posterMode && pickMode) {
            await page.bringToFront();
            console.log(
              `\n  ${project.slug} ${route.path} is open at ${POSTER.width}px.\n` +
                `  Get it to the moment you want, then press Enter here to capture.\n` +
                `  (Scroll position does not matter, the capture takes the whole page.)`
            );
            await waitForEnter();
          }

          /* A `position: fixed` element is painted ONCE, wherever it sat in
           * the viewport, and a full-page capture is many viewports tall. A
           * pinned bottom bar therefore comes out as a band slicing through
           * the middle of the page: Create Space's "your work, out into the
           * world" strip cut straight across its hero photograph.
           *
           * display, not visibility: a child that sets `visibility: visible`
           * overrides a hidden parent, which left Create Space's avatar
           * floating on its own where the bar had been. A fixed element is
           * out of flow, so removing it reflows nothing either way. Sticky is
           * left alone, since that renders at its natural place in the flow. */
          if (posterMode) {
            const pinned = await page.evaluate(() => {
              let n = 0;
              for (const el of document.body.querySelectorAll("*")) {
                const cs = getComputedStyle(el);
                if (cs.position === "fixed" && cs.display !== "none") {
                  el.style.setProperty("display", "none", "important");
                  n++;
                }
              }
              return n;
            });
            if (pinned) console.log(`    hid ${pinned} pinned element${pinned === 1 ? "" : "s"}`);
          }

          /* Some open states are reachable only with the pointer parked on
           * something, and cannot be reached by scrolling at all. On
           * SignatureStyle the masthead is full size only at scrollY === 0
           * while the photo clusters bloom at scrollY > 30, so the two states
           * she wants are mutually exclusive by scroll. Hover is the way out:
           * the gallery also blooms on engagement, and a parked cursor holds
           * that open while the page stays at the top. Puppeteer's hover
           * dispatches real pointer events, so React's onMouseEnter fires.
           *
           * The cursor is left where it is: moving it away would un-engage. */
          if (posterMode && route.posterHover) {
            /* mouse.move to a measured point, NOT page.hover(selector):
             * hover() scrolls the element into view first, and that scroll is
             * itself a state change. It condensed SignatureStyle's masthead,
             * costing the capture the one thing the top of the page is for.
             * Only elements already on screen are eligible, which is the right
             * constraint anyway: the open state has to be reachable from where
             * the page rests. */
            const box = await page.evaluate((sel) => {
              for (const el of document.querySelectorAll(sel)) {
                const r = el.getBoundingClientRect();
                if (r.width < 20 || r.height < 20) continue;
                /* The point aimed at has to be on screen; the element itself
                 * may run past the fold, which most of them do once a tall
                 * masthead is in frame. */
                const x = r.x + r.width / 2;
                const y = Math.min(r.y + r.height / 2, window.innerHeight - 8);
                if (y > r.y && y > 0 && x > 0 && x < window.innerWidth) return { x, y };
              }
              return null;
            }, route.posterHover);
            if (!box) {
              throw new Error(
                `posterHover: nothing matching ${route.posterHover} is on screen at rest`
              );
            }
            await page.mouse.move(box.x, box.y);
            await new Promise((r) => setTimeout(r, route.posterHoverWait ?? 1400));

            /* The cursor that opened the gallery is also sitting ON a card,
             * which lifts and scales it and shows its label: one photo
             * singled out in a composition meant to read as a whole.
             *
             * It cannot simply be parked in a corner. The engagement that
             * holds every cluster open is released on mouseleave of the
             * gallery, so moving outside folds the whole thing back to clumps
             * and the capture comes back saying "hover to explore". It has to
             * land in a gap BETWEEN the cards: still inside the gallery, on
             * none of them. */
            if (route.posterHoverPark) {
              const gap = await page.evaluate((sel) => {
                const cards = [...document.querySelectorAll(sel)].filter((e) => {
                  const r = e.getBoundingClientRect();
                  return r.width > 20 && r.height > 20;
                });
                if (!cards.length) return null;

                /* The gallery blooms on mouseenter of its own container and
                 * releases on mouseleave, so the cursor has to stay inside it.
                 * The container is not addressable by class, so take the
                 * smallest ancestor holding every card. */
                let box = cards[0];
                while (box && !cards.every((c) => box.contains(c))) box = box.parentElement;
                if (!box) return null;
                const b = box.getBoundingClientRect();

                const rects = cards.map((c) => c.getBoundingClientRect());
                const pad = 8; // cards are rotated, so their boxes understate the edges
                const free = (x, y) =>
                  !rects.some(
                    (r) =>
                      x >= r.left - pad && x <= r.right + pad &&
                      y >= r.top - pad && y <= r.bottom + pad
                  ) && box.contains(document.elementFromPoint(x, y));

                const x0 = Math.max(b.left + 2, 2);
                const x1 = Math.min(b.right - 2, window.innerWidth - 2);
                const y0 = Math.max(b.top + 2, 2);
                const y1 = Math.min(b.bottom - 2, window.innerHeight - 2);
                const N = 40;
                for (let gy = 0; gy <= N; gy++) {
                  for (let gx = 0; gx <= N; gx++) {
                    const x = x0 + ((x1 - x0) * gx) / N;
                    const y = y0 + ((y1 - y0) * gy) / N;
                    if (free(x, y)) return { x, y };
                  }
                }
                return null;
              }, route.posterHover);
              if (!gap) {
                throw new Error("posterHoverPark: no gap inside the gallery to rest the cursor in");
              }
              await page.mouse.move(gap.x, gap.y);
              await new Promise((r) => setTimeout(r, 900));
            }
          }

          /* A route marked `auth` that ends up on a sign-in form captured the
           * wrong thing, and it looks like a perfectly good screenshot in the
           * output: three of today's runs quietly produced login pages because
           * the session was signed in to a different browser than the capture
           * profile. Fail loudly instead, and say what to do about it. */
          if (route.auth) {
            const landed = await page.evaluate(() => ({
              url: location.pathname + location.search,
              looksLikeLogin:
                /\b(sign in|sign up|log in|login)\b/i.test(
                  document.body.innerText.slice(0, 400)
                ) && /password/i.test(document.body.innerHTML),
            }));
            const redirected =
              !route.path.startsWith(landed.url.split("?")[0]) &&
              !landed.url.startsWith(route.path.split("?")[0]);
            /* `expect` is the reliable form: a signed-out app does not always
             * redirect or show a password field. Hummingbird's logged-out
             * state is a welcome screen at the very same URL, which no generic
             * heuristic can tell from the real thing. Naming a string that
             * only appears when signed in can. */
            if (route.expect) {
              const want = [route.expect].flat();
              /* Poll rather than read once. A fixed `wait` is a guess about how
                 long someone else's database takes, and losing that race
                 photographs a loading state -- Hummingbird's songbook came back
                 reading "0 SONGS" and "gathering your songbook..." while its
                 own data was still in flight. */
              const deadline = Date.now() + (route.expectTimeout ?? 15000);
              let text = "";
              let missing = want;
              while (Date.now() < deadline) {
                text = await page.evaluate(() => document.body.innerText);
                missing = want.filter((w) => !text.includes(w));
                if (!missing.length) break;
                await new Promise((r) => setTimeout(r, 400));
              }
              if (missing.length) {
                throw new Error(
                  `expected ${missing.map((m) => JSON.stringify(m)).join(", ")} on the page and it is not there` +
                    ` — likely signed out. Run: npm run shots -- --login --project ${project.slug}`
                );
              }
            }
            if (landed.looksLikeLogin && redirected) {
              throw new Error(
                `signed out — landed on ${landed.url}. ` +
                  `Run: npm run shots -- --login --project ${project.slug}`
              );
            }
          }

          /* Client work can be shown as a working system without showing the
           * client's business. `blur` takes the selectors holding the names
           * and titles and softens them in the page before the shot, so the
           * structure, the phases and the counts still read while nothing
           * identifiable survives into a file that gets deployed. Done in the
           * page rather than over the image afterwards, so it stays correct
           * when the layout moves. */
          if (route.blur) {
            const blurred = await page.evaluate((sels, px) => {
              let n = 0;
              for (const sel of sels) {
                for (const el of document.querySelectorAll(sel)) {
                  el.style.setProperty("filter", `blur(${px}px)`, "important");
                  n++;
                }
              }
              return n;
            }, [route.blur].flat(), route.blurAmount ?? 4);
            console.log(`    blurred ${blurred} element${blurred === 1 ? "" : "s"}`);
          }

          /* An app shell scrolls INSIDE itself: React Native Web, and anything
           * else that pins a root to 100vh and puts a scroll container in it,
           * has a document exactly one viewport tall however much content it
           * holds, and its shell is a narrow column on a wide backdrop.
           *
           * Do NOT try to free the scroller. Undoing the height chain does
           * expand the document, but a windowed list re-measures against the
           * broken box and renders nothing: Hummingbird came back reading
           * "0 SONGS" and "gathering your songbook..." with its data already
           * loaded. `posterHeight` asks for a very tall viewport instead, so
           * the app lays itself out long of its own accord, and the shell is
           * only measured, never modified. */
          let shellBox = null;
          if (posterMode && route.posterShell) {
            shellBox = await page.evaluate(() => {
              const scrollers = [...document.querySelectorAll("*")].filter((el) => {
                const cs = getComputedStyle(el);
                return (
                  /auto|scroll|hidden/.test(cs.overflowY) &&
                  el.clientHeight > 200 &&
                  el.clientWidth > 200 &&
                  el.clientWidth < window.innerWidth * 0.8
                );
              });
              if (!scrollers.length) return null;
              // The tallest narrow column is the shell, not a card inside it.
              scrollers.sort((a, b) => b.clientHeight - a.clientHeight);
              const r = scrollers[0].getBoundingClientRect();
              return {
                x: Math.max(0, Math.round(r.x + window.scrollX)),
                y: Math.max(0, Math.round(r.y + window.scrollY)),
                width: Math.round(r.width),
                height: Math.round(r.height),
              };
            });
            if (shellBox) {
              console.log(
                `    shell ${shellBox.width}x${shellBox.height} at ${shellBox.x},${shellBox.y}`
              );
            }
          }


          if (posterMode) {
            /* Straight to webp at the card's own width. The intermediate png
             * is 2x and large; nothing downstream wants it. */
            const tmp = path.join(dir, `.${route.name}-poster.png`);
            await page.screenshot({ path: tmp, fullPage: true });
            const file = path.join(
              dir,
              allMode ? `poster-${route.name}.webp` : "fullpage.webp"
            );
            const { width: rw, height: rh } = await sharp(tmp).metadata();

            /* A marketing page can run eight screens deep, and the hover has
             * three seconds: past a point the reveal stops reading as someone
             * scrolling and starts reading as a page being flung. Cap the
             * capture rather than speed the animation up, so every card moves
             * at the same pace and a long page simply shows its first stretch.
             * `posterTop` starts the crop lower where the top is the dull bit. */
            /* An expanded app shell is cropped to the shell itself; everything
               else keeps the full width of the page. */
            /* expandBox is measured in CSS pixels; the capture is in device
               pixels, which are not the same thing above 1x. */
            const dpr = route.posterScale ?? POSTER.scale;
            const box = shellBox
              ? {
                  left: Math.max(0, Math.min(Math.round(shellBox.x * dpr), rw - 1)),
                  width: Math.min(
                    Math.round(shellBox.width * dpr),
                    rw - Math.max(0, Math.round(shellBox.x * dpr))
                  ),
                  top0: Math.max(0, Math.min(Math.round(shellBox.y * dpr), rh - 1)),
                  height: Math.min(
                    Math.round(shellBox.height * dpr),
                    rh - Math.max(0, Math.round(shellBox.y * dpr))
                  ),
                }
              : { left: 0, width: rw, top0: 0, height: rh };

            const top = Math.min(route.posterTop ?? 0, Math.max(0, box.height - 100));
            const maxH = Math.round(box.width * POSTER.ratio.max);
            const h0 = Math.min(box.height - top, maxH);
            const cropped = box.left > 0 || box.width < rw || top > 0 || h0 < box.height;

            let pipeline = sharp(tmp);
            if (cropped) {
              pipeline = pipeline.extract({
                left: box.left,
                top: box.top0 + top,
                width: box.width,
                height: h0,
              });
            }
            await pipeline
              .resize({ width: Math.min(box.width, POSTER.width) })
              .webp({ quality: 82 })
              .toFile(file);
            await unlink(tmp).catch(() => {});

            const ratio = h0 / box.width;
            const w = POSTER.width;
            const h = Math.round(w * ratio);
            const note = cropped
              ? `  (cropped from ${rw}x${rh})`
              : ratio < POSTER.ratio.min
                ? "  short — little to reveal on hover"
                : "";
            console.log(`  ✓ ${file}  ${w}x${h}  ${ratio.toFixed(2)}x tall${note}`);
            posters.push({ slug: project.slug, file, w: box.width, h: h0 });
            saved++;
            continue;
          }

          const file = path.join(dir, `${route.name}-${vp.label}.png`);
          await page.screenshot({ path: file, fullPage: clip ? false : fullPage, clip });
          console.log(`  ✓ ${file}`);
          saved++;
        } catch (err) {
          skipped.push(`${project.slug} ${route.path} @${vp.label}: ${err.message}`);
          console.log(`  ✗ ${route.path} @${vp.label}: ${err.message}`);
        } finally {
          await page.close();
          await context?.close();
        }
      }
    }
  }
} finally {
  await browser.close();
}

console.log(`\n${saved} screenshot${saved === 1 ? "" : "s"} saved.`);

/* A capture's shape decides how far it scrolls on hover, and it changes every
 * time the page or the crop changes. Hand-copying it into lib/posters.ts meant
 * the registry could disagree with the file on disk and nothing would say so:
 * cropping 50 States left a stale ratio behind within the minute. The sizes go
 * to a manifest the registry reads instead.
 *
 * Which apps get a real screen, and where it sits on the artwork, stays in
 * posters.ts: those are judgements, not measurements. */
if (posters.length) {
  const file = "lib/screen-sizes.json";
  let sizes = {};
  try {
    sizes = JSON.parse(await readFile(file, "utf8"));
  } catch {}
  for (const p of posters) sizes["/" + path.relative("public", p.file)] = [p.w, p.h];
  const sorted = Object.fromEntries(Object.entries(sizes).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(file, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`\n${file} updated (${posters.length} measured, ${Object.keys(sorted).length} total)`);
}
if (skipped.length) {
  console.log(`\n${skipped.length} skipped:`);
  skipped.forEach((s) => console.log(`  - ${s}`));
}
