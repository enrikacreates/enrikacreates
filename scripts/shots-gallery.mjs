/**
 * Build a local contact sheet of every poster capture.
 *
 *   npm run shots:gallery      then open http://localhost:3000/_shots.html
 *
 * Deliberately written into public/ and gitignored rather than built as a
 * route: it exists to be looked at while choosing, it lists client screens
 * that have no business on a public portfolio, and a page nobody ships is a
 * page nobody has to maintain.
 */

import { readdir, writeFile, readFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const BASE = "public/assets/projects";

/* Which captures are actually seated on a card, read from the registry rather
 * than guessed from the filename: fullpage.webp exists for several projects
 * that are not wired up, and a gold outline that lies is worse than none. */
const registry = await readFile("lib/posters.ts", "utf8");
const screensBlock = registry.slice(
  registry.indexOf("const SCREENS"),
  registry.indexOf("};", registry.indexOf("const SCREENS"))
);
const live = new Set([...screensBlock.matchAll(/src:\s*"([^"]+)"/g)].map((m) => m[1]));

const groups = [];
for (const p of (await readdir(BASE)).sort()) {
  const dir = path.join(BASE, p, "shots");
  let files;
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".webp")).sort();
  } catch {
    continue;
  }
  if (!files.length) continue;
  const items = [];
  for (const f of files) {
    const full = path.join(dir, f);
    const { width, height } = await sharp(full).metadata();
    const { size } = await stat(full);
    const url = "/" + path.relative("public", full);
    items.push({
      f, url, width, height,
      ratio: (height / width).toFixed(2),
      kb: Math.round(size / 1024),
      live: live.has(url),
    });
  }
  groups.push({ p, items });
}

const card = (i) => `
  <figure class="shot${i.live ? " live" : ""}">
    <a href="${i.url}" target="_blank"><span class="win"><img src="${i.url}" alt=""></span></a>
    <figcaption>
      <b>${i.f.replace(/^poster-|\.webp$/g, "")}</b>${i.live ? " <em>on the card</em>" : ""}
      <span>${i.ratio}x tall · ${i.width}×${i.height} · ${i.kb} KB</span>
    </figcaption>
  </figure>`;

const html = `<!doctype html><meta charset=utf-8><title>Captures</title>
<meta name=viewport content="width=device-width,initial-scale=1">
<style>
  :root { --bg:#F7F2E9; --ink:#2A2724; --mute:#8A8176; --card:#FFFDF7 }
  * { box-sizing:border-box }
  body { margin:0; padding:28px 16px 80px; background:var(--bg); color:var(--ink);
         font:14px/1.5 ui-sans-serif,-apple-system,system-ui,sans-serif }
  h1 { font-size:22px; margin:0 0 4px }
  .sub { color:var(--mute); margin:0 0 32px }
  h2 { font-size:15px; letter-spacing:.08em; text-transform:uppercase; color:var(--mute);
       margin:40px 0 14px; padding-bottom:8px; border-bottom:1px solid rgba(0,0,0,.08) }
  .row { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:16px }
  .shot { margin:0; background:var(--card); border-radius:10px; padding:10px;
          box-shadow:0 1px 2px rgba(0,0,0,.05) }
  .shot.live { outline:2px solid #E8A33D; outline-offset:2px }
  .win { display:block; height:300px; overflow:hidden; border-radius:6px; background:#fff;
         border:1px solid rgba(0,0,0,.07) }
  .win img { display:block; width:100%; height:auto }
  figcaption { padding:8px 2px 2px; display:flex; flex-direction:column; gap:2px }
  figcaption b { font-weight:600 }
  figcaption em { color:#C2871F; font-style:normal; font-size:11px; letter-spacing:.06em;
                  text-transform:uppercase }
  figcaption span { color:var(--mute); font-size:12px }
  a { color:inherit }
</style>
<h1>Poster captures</h1>
<p class=sub>Top 300px of each. Click one to open it full size. Gold outline = seated on a card right now. Usable hover range is 2.2x–4.3x tall.</p>
${groups.map((g) => `<h2>${g.p}</h2><div class=row>${g.items.map(card).join("")}</div>`).join("")}
`;

await writeFile("public/_shots.html", html);
console.log(
  `public/_shots.html — ${groups.length} projects, ` +
    `${groups.reduce((n, g) => n + g.items.length, 0)} captures, ` +
    `${live.size} seated`
);
