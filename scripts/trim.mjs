/**
 * Trim uniform margins off a screenshot.
 *
 *   node scripts/trim.mjs <file.png> [padding] [tolerance]
 *
 * Some captures cannot be framed by element: an overlay whose wrapper is full
 * width leaves the real content floating in a sea of ground colour, and no
 * selector picks out the part a person actually looks at. This finds the
 * content by pixel instead: it samples the four corners for the ground colour,
 * then walks in from each edge until a row or column differs enough to matter.
 *
 * Rewrites the file in place. Does nothing if there is nothing to trim.
 */
import puppeteer from "puppeteer-core";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const file = process.argv[2];
const pad = Number(process.argv[3] ?? 24);
const tol = Number(process.argv[4] ?? 26);
if (!file) { console.error("usage: node scripts/trim.mjs <file.png> [pad]"); process.exit(1); }

const b = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
});
const p = await b.newPage();
const data = readFileSync(path.resolve(file)).toString("base64");

const out = await p.evaluate(async (b64, pad, tol) => {
  const img = new Image();
  img.src = "data:image/png;base64," + b64;
  await img.decode();
  const W = img.naturalWidth, H = img.naturalHeight;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d", { willReadFrequently: true });
  x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, W, H).data;
  const at = (px, py) => { const i = (py * W + px) * 4; return [d[i], d[i+1], d[i+2]]; };
  // Ground colour = the most common of the four corners.
  const corners = [at(2,2), at(W-3,2), at(2,H-3), at(W-3,H-3)];
  const key = (c) => c.join(",");
  const tally = {};
  for (const c of corners) tally[key(c)] = (tally[key(c)] ?? 0) + 1;
  const ground = Object.entries(tally).sort((a,b) => b[1]-a[1])[0][0].split(",").map(Number);
  const far = (px, py) => { const c = at(px, py); return Math.abs(c[0]-ground[0]) + Math.abs(c[1]-ground[1]) + Math.abs(c[2]-ground[2]) > tol; };
  const colBusy = (px) => { let n = 0; for (let py = 0; py < H; py += 3) if (far(px, py)) n++; return n > 3; };
  const rowBusy = (py) => { let n = 0; for (let px = 0; px < W; px += 3) if (far(px, py)) n++; return n > 3; };
  let L = 0, R = W - 1, T = 0, B = H - 1;
  while (L < R && !colBusy(L)) L++;
  while (R > L && !colBusy(R)) R--;
  while (T < B && !rowBusy(T)) T++;
  while (B > T && !rowBusy(B)) B--;
  L = Math.max(0, L - pad); T = Math.max(0, T - pad);
  R = Math.min(W - 1, R + pad); B = Math.min(H - 1, B + pad);
  const w = R - L + 1, h = B - T + 1;
  if (w >= W - 4 && h >= H - 4) return null;
  const o = document.createElement("canvas");
  o.width = w; o.height = h;
  o.getContext("2d").drawImage(c, L, T, w, h, 0, 0, w, h);
  return { url: o.toDataURL("image/png"), was: [W, H], now: [w, h] };
}, data, pad, tol);

await b.close();
if (!out) { console.log(`${path.basename(file)}: nothing to trim`); process.exit(0); }
writeFileSync(path.resolve(file), Buffer.from(out.url.split(",")[1], "base64"));
console.log(`${path.basename(file)}: ${out.was.join("x")} -> ${out.now.join("x")}`);
