/**
 * Capture app screenshots for project case studies.
 *
 *   npm run shots                      every project in shots.config.mjs
 *   npm run shots -- --project 50-states-of-freedom
 *   npm run shots -- --full            full-page instead of one viewport
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
import { mkdir, access } from "node:fs/promises";
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
const fullPage = flag("full");
const listOnly = flag("list");
const loginMode = flag("login");

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
    for (const r of p.routes) {
      const sizes = VIEWPORTS.map((v) => `${r.name}-${v.label}.png`).join("  ");
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
  headless: !loginMode,
  userDataDir: PROFILE,
  defaultViewport: loginMode ? null : undefined,
  args: ["--hide-scrollbars", "--force-color-profile=srgb"],
});

/* `--login`: open the app and wait. Nothing is captured and nothing is typed
 * for you; close the window when you're signed in to each app you want. */
if (loginMode) {
  const page = (await browser.pages())[0] ?? (await browser.newPage());
  const start = targets[0];
  await page.goto(start.baseUrl, { waitUntil: "domcontentloaded" }).catch(() => {});
  console.log(
    `\nSigning-in window open at ${start.baseUrl}\n` +
      `  Sign in to each app you want captured, then press Enter here.\n` +
      `  The session is kept in ${path.relative(process.cwd(), PROFILE)}/ and reused by later runs.\n`
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

let saved = 0;
const skipped = [];

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

    for (const route of project.routes) {
      if (route.auth) {
        console.log(`  ! ${route.path} ${route.auth} — capturing whatever renders`);
      }

      for (const vp of VIEWPORTS) {
        const page = await browser.newPage();
        try {
          await page.setViewport({
            width: vp.width,
            height: vp.height,
            deviceScaleFactor: 2, // retina, so it holds up scaled down
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

          if (route.wait) {
            await new Promise((r) => setTimeout(r, route.wait));
          }

          const file = path.join(dir, `${route.name}-${vp.label}.png`);
          await page.screenshot({ path: file, fullPage });
          console.log(`  ✓ ${file}`);
          saved++;
        } catch (err) {
          skipped.push(`${project.slug} ${route.path} @${vp.label}: ${err.message}`);
          console.log(`  ✗ ${route.path} @${vp.label}: ${err.message}`);
        } finally {
          await page.close();
        }
      }
    }
  }
} finally {
  await browser.close();
}

console.log(`\n${saved} screenshot${saved === 1 ? "" : "s"} saved.`);
if (skipped.length) {
  console.log(`\n${skipped.length} skipped:`);
  skipped.forEach((s) => console.log(`  - ${s}`));
}
