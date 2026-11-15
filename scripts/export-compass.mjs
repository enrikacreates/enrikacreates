#!/usr/bin/env node
// Export the Design Compass one-sheet from its design canvas to a static page.
//
// The canvas (https://claude.ai/artifact/S37tHM1YbSJM9uRm17zzMZ) is the source
// of truth. Download its project/Main.dc.html plus the /_blob/<id> images it
// references into one folder, then run:
//
//   node scripts/export-compass.mjs <path/to/Main.dc.html> <assets-dir>
//
// Writes public/compass.html (served at /compass by the rewrite in
// next.config.mjs) and copies the images to public/assets/compass/.

import fs from "node:fs";
import path from "node:path";

const [src, assetsDir] = process.argv.slice(2);
if (!src || !assetsDir) {
  console.error("usage: node scripts/export-compass.mjs <Main.dc.html> <assets-dir>");
  process.exit(1);
}

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const outHtml = path.join(root, "public", "compass.html");
const outAssets = path.join(root, "public", "assets", "compass");
fs.mkdirSync(outAssets, { recursive: true });

let html = fs.readFileSync(src, "utf8");

// 1. Canvas images: /_blob/<id> -> /assets/compass/<id>.<ext>
const files = fs.readdirSync(assetsDir);
const missing = [];
html = html.replace(/\/_blob\/([0-9a-f]{32})/g, (m, id) => {
  const file = files.find((f) => f.startsWith(id + "."));
  if (!file) {
    missing.push(id);
    return m;
  }
  fs.copyFileSync(path.join(assetsDir, file), path.join(outAssets, file));
  return `/assets/compass/${file}`;
});
if (missing.length) {
  console.error("Missing images (download them from the canvas first):\n  " + missing.join("\n  "));
  process.exit(1);
}

// 2. Unwrap the canvas runtime: keep <helmet> contents for <head>, drop the rest.
const helmet = (html.match(/<helmet>([\s\S]*?)<\/helmet>/) || [, ""])[1].trim();
const body = html
  .replace(/^[\s\S]*?<x-dc>/, "")
  .replace(/<\/x-dc>[\s\S]*$/, "")
  .replace(/<helmet>[\s\S]*?<\/helmet>/, "")
  .trim();

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>My Design Compass · Enrika Greathouse</title>
<meta name="description" content="How I design: Story Leads, Feelings First, Make It Real. The Soundboard is the how, Fill the Gauge is the check.">
<meta property="og:title" content="My Design Compass · Enrika Greathouse">
<meta property="og:description" content="It's all storytelling… help them feel something real!">
<meta property="og:image" content="/assets/compass/${files.find((f) => f.startsWith("ff496622")) || ""}">
<link rel="icon" href="/favicon.ico">
${helmet}
<style>
  html { -webkit-text-size-adjust: 100%; }
  body { margin: 0; background: #F8F7F4; }
  .topbar { max-width: 1200px; margin: 0 auto; box-sizing: border-box; padding: 20px 80px 0; display: flex; align-items: center; gap: 16px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #6B665E; }
  .topbar a { color: inherit; text-decoration: none; }
  .topbar a:hover { color: #1C1B19; }
  .topbar .mark { display: block; width: 64px; }
  .topbar .mark img { display: block; width: 100%; height: auto; }
  .topbar ol { list-style: none; margin: 0; padding: 0; display: flex; gap: 8px; }
  .topbar li + li::before { content: "/"; margin-right: 8px; color: #B9B3A8; }
  .topbar [aria-current] { color: #1C1B19; }
  .sheet { display: flex; justify-content: center; }
  .sheet > div { min-height: 0 !important; }

  /* Below the 1200px design width, the sheet reflows to one column. */
  @media (max-width: 1199px) {
    .topbar { padding: 16px 20px 0; }
    .sheet > div { width: 100% !important; padding: 32px 20px 48px !important; }
    .sheet * { max-width: 100%; box-sizing: border-box; }
    .sheet svg { height: auto; }
    .sheet [style*="grid-template-columns: repeat(3"] { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important; }
    .sheet [style*="span 2"] { grid-column: auto !important; }
  }
  @media (max-width: 760px) {
    .sheet [style*="grid-template-columns: repeat(10"] { grid-template-columns: repeat(5, minmax(0, 1fr)) !important; row-gap: 20px !important; column-gap: 4px !important; }
    .sheet [style*="grid-template-columns: repeat(10"] * { font-size: 12px !important; }
    .sheet [style*="grid-template-columns: repeat(8"] { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
    .sheet [style*="display: flex"]:not([style*="flex-direction: column"]) { flex-wrap: wrap; }
    .sheet h1 img { width: 100% !important; max-width: 460px; }
    .sheet header > div[style*="position: absolute"] { position: relative !important; width: 100% !important; height: 300px !important; margin-top: 12px; }
    .sheet header > div[style*="position: absolute"] img { width: 100% !important; height: 100% !important; }
    /* The path's dotted connector only makes sense in one long row. */
    .sheet svg[style*="position: absolute"][viewBox="0 0 880 20"] { display: none; }
    /* Feeling Compass: stack the dial, then its four points two by two. */
    .sheet [style*="height: 640px"] { height: auto !important; display: grid; grid-template-columns: 1fr 1fr; gap: 20px 12px; padding: 28px 20px; }
    .sheet [style*="height: 640px"] > * { position: static !important; margin: 0 !important; width: auto !important; }
    .sheet [style*="height: 640px"] > :nth-child(1) { grid-column: 1 / -1; order: 1; }
    .sheet [style*="height: 640px"] > :nth-child(1) svg { width: 100%; }
    .sheet [style*="height: 640px"] > :nth-child(6) { grid-column: 1 / -1; order: 0; }
    .sheet [style*="height: 640px"] > :nth-child(2) { order: 2; }
    .sheet [style*="height: 640px"] > :nth-child(3) { order: 3; }
    .sheet [style*="height: 640px"] > :nth-child(4) { order: 4; }
    .sheet [style*="height: 640px"] > :nth-child(5) { order: 5; }
    .sheet [style*="height: 640px"] > :nth-child(7) { grid-column: 1 / -1; order: 6; text-align: center; }
    .sheet [style*="font-size: 88px"] { font-size: 56px !important; }
    .sheet [style*="font-size: 46px"] { font-size: 34px !important; }
  }
  @media print { .topbar { display: none; } }
</style>
</head>
<body>
<nav class="topbar" aria-label="Breadcrumb">
  <a class="mark" href="/" aria-label="Enrika Greathouse home"><img src="/assets/enrikamark2.svg" alt=""></a>
  <ol>
    <li><a href="/">Home</a></li>
    <li><span aria-current="page">Design Compass</span></li>
  </ol>
</nav>
<main class="sheet">
${body}
</main>
</body>
</html>
`;

fs.writeFileSync(outHtml, page);
console.log(`Wrote ${path.relative(root, outHtml)} and ${files.length} images to public/assets/compass/`);
