/**
 * Capture app screenshots for project case studies.
 *
 *   npm run shots                      every project in shots.config.mjs
 *   npm run shots -- --project 50-states-of-freedom
 *   npm run shots -- --full            full-page instead of one viewport
 *   npm run shots -- --list            print what would be captured, visit nothing
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
  headless: true,
  args: ["--hide-scrollbars", "--force-color-profile=srgb"],
});

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

          const url = new URL(route.path, project.baseUrl).toString();
          await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 30000,
          });
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
