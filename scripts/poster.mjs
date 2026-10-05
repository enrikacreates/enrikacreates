#!/usr/bin/env node
/**
 * Poster maker.
 *
 *   npm run poster -- --slug bernadettejiwa --subject "an open book ..."
 *
 * Generating the image is the easy half. The half that actually ate the time,
 * doing these nine by hand, was everything after it:
 *
 *   - cropping to the 4:5 the cards are built around
 *   - sampling the poster's own background colour, which the case page uses as
 *     its page colour so the banner has no visible join
 *   - finding where the artwork stops and the empty ground starts, which is
 *     what makes the banner's "bottom" crop mean anything
 *   - writing all of that into lib/posters.ts
 *
 * So the script does those too. --dry-run stops before calling the API and is
 * the fastest way to check the prompt.
 *
 * Matches the SignatureStyle setup: same model, same OPENAI_API_KEY, same
 * retry-on-429 shape as supabase/functions/_shared/openaiImage.ts, because the
 * org's image rate limit is low and a burst otherwise just fails.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Matches signaturestyle/supabase/functions/_shared/models.ts. */
const IMAGE_MODEL = "gpt-image-2.5-sunburst";
const GENERATIONS_URL = "https://api.openai.com/v1/images/generations";

/** What the cards are built around: .poster-plate crops a 4:5 source. */
const TARGET_W = 1122;
const TARGET_H = 1402;

const STYLE_FILE = path.join(ROOT, "scripts", "poster-style.md");
const POSTERS_DIR = path.join(ROOT, "public", "assets", "posters");
/**
 * The untouched illustration, kept beside the composited card.
 *
 * Compositing has to be repeatable: seating a screenshot onto <slug>.png and
 * then doing it again would stack one screenshot on the last. So generation
 * writes the art here, compositing always reads from here, and <slug>.png is
 * the finished card the site loads. Re-run --screen as many times as you like.
 */
const artPath = (slug) => path.join(POSTERS_DIR, `${slug}-art.png`);
const POSTERS_TS = path.join(ROOT, "lib", "posters.ts");
const LOG_DIR = path.join(ROOT, "scripts", "poster-log");

/* ---------- args ---------- */

function parseArgs(argv) {
  const out = { size: "1024x1536", quality: "high" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    if (
      key === "dry-run" ||
      key === "force" ||
      key === "measure-only" ||
      key === "no-screen" ||
      key === "screen-shadow"
    ) {
      out[key] = true;
      continue;
    }
    out[key] = argv[++i];
  }
  return out;
}

function usage(msg) {
  if (msg) console.error(`\n  ${msg}\n`);
  console.error(`  Usage:
    npm run poster -- --slug <slug> --subject "<what to draw>" [options]

    --slug          project slug; also the output filename
    --subject       the per-project subject line
    --color         background colour hint for the prompt (default: let it choose)
    --notes         revision notes, appended to the prompt. Use with --force to
                    redo one poster: --notes "navy background, fewer papers"
    --size          API image size (default 1024x1536)
    --quality       low | medium | high (default high)
    --dry-run       print the prompt and stop, no API call
    --measure-only  re-measure an existing poster and rewrite lib/posters.ts
    --force         overwrite an existing poster file

  Seating a real screenshot into the artwork (the "make it real" treatment):
    --screen <path>   screenshot to composite into the drawn browser frame
    --screen-width    fraction of poster width (default 0.78)
    --screen-top      fraction of poster height for its top edge (default 0.52)
    --screen-x        fraction for its left edge (default: centred)
    --screen-shadow   add a faint contact shadow under the screen (off by
                      default: the illustrations cast none, so it reads as the
                      one lit object in an unlit scene)
    --no-screen       rebuild <slug>.png from the artwork alone, dropping the
                      screenshot. Use when a capture does not work for you.
`);
  process.exit(msg ? 1 : 0);
}

/* ---------- key ---------- */

async function apiKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  // Same place the Sanity tokens live, so there's one answer to "where do
  // secrets go in this repo".
  const envPath = path.join(ROOT, ".env.local");
  if (existsSync(envPath)) {
    const line = (await readFile(envPath, "utf8"))
      .split("\n")
      .find((l) => l.startsWith("OPENAI_API_KEY="));
    if (line) return line.slice("OPENAI_API_KEY=".length).trim().replace(/^["']|["']$/g, "");
  }
  usage(
    "No OPENAI_API_KEY. Add it to .env.local (next to the Sanity tokens) or export it.\n" +
    "  It's the same key SignatureStyle's edge functions use."
  );
}

/* ---------- prompt ---------- */

async function buildPrompt({ subject, color, notes }) {
  const raw = await readFile(STYLE_FILE, "utf8");
  const body = raw.split(/^---$/m).slice(1).join("---").trim();
  if (!body) usage(`${STYLE_FILE} has no prompt body under its --- separator.`);
  const base = body
    .replaceAll("{{SUBJECT}}", subject)
    .replaceAll("{{COLOR}}", color || "a single colour from the project's palette");

  // Notes go last and are marked as corrections, so they override the style
  // above rather than reading as more of the brief. A revision is usually
  // "the same thing but less of X", which only works if X is already stated.
  return notes ? `${base}\n\nImportant corrections, these take priority over anything above:\n${notes}` : base;
}

/* ---------- generation ---------- */

/**
 * Retry on 429 only, honouring Retry-After. Same shape as the SignatureStyle
 * helper: the org's image limit is low enough that a couple of posters in a row
 * will hit it, and failing the whole run for a rate limit would be silly.
 */
async function generate(key, prompt, { size, quality }) {
  const body = { model: IMAGE_MODEL, prompt, size, quality, n: 1 };

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(GENERATIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const json = await res.json();
      const b64 = json?.data?.[0]?.b64_json;
      if (!b64) throw new Error(`No image in response: ${JSON.stringify(json).slice(0, 400)}`);
      return Buffer.from(b64, "base64");
    }

    const text = await res.text().catch(() => "");

    if (res.status !== 429 || attempt >= 5) {
      // Size is the one parameter worth calling out: the supported set is
      // model-specific, and 4:5 may not be among them (the script crops to 4:5
      // afterwards either way).
      const hint = /size/i.test(text)
        ? "\n  The size may not be supported by this model. Try --size 1024x1024 or 1024x1536."
        : "";
      throw new Error(`OpenAI ${res.status}: ${text.slice(0, 500)}${hint}`);
    }

    const retryAfter = Number(res.headers.get("retry-after"));
    const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? Math.min(retryAfter * 1000, 20000)
      : Math.min(9000 + attempt * 4000, 20000);
    console.log(`  rate limited, waiting ${Math.round(waitMs / 1000)}s (attempt ${attempt + 1}/5)`);
    await new Promise((r) => setTimeout(r, waitMs));
  }
}

/* ---------- the screenshot treatment ---------- */

/**
 * Seat a real screenshot into the poster's drawn browser frame.
 *
 * The point is that a generated illustration, however good, is a picture of
 * nothing. A real screen is evidence. But a screenshot blown up full bleed
 * loses the illustration entirely and the grid stops looking like anyone's in
 * particular, so the screen sits small inside the frame with the artwork still
 * reading around it.
 *
 * It deliberately bleeds off the bottom of the card. The plate crops the poster
 * to 8:9 from the top, so a screen anchored low is cut mid-content: enough to
 * show the thing is real, not enough to answer what it does. That unanswered
 * question is the reason to click.
 */
async function seatScreen(artFile, screenFile, outFile, opts = {}) {
  const { width: PW, height: PH } = await sharp(artFile).metadata();

  const wFrac = Number(opts.screenWidth ?? 0.74);
  const topFrac = Number(opts.screenTop ?? 0.52);
  const w = Math.round(PW * wFrac);
  const x = Math.round(
    opts.screenX !== undefined ? PW * Number(opts.screenX) : (PW - w) / 2
  );
  const y = Math.round(PH * topFrac);
  // Tall enough to reach past the poster's foot, so the plate's crop is what
  // cuts it rather than the image running out.
  const h = Math.max(1, PH - y);

  const shot = await sharp(screenFile)
    .resize(w, h, { fit: "cover", position: "top" })
    .toBuffer();

  // Rounded top corners only: the bottom is cropped away, and rounding a
  // corner that gets cut just leaves a notch.
  const r = Math.round(PW * 0.012);
  const mask = Buffer.from(
    `<svg width="${w}" height="${h}"><rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}"/><rect x="0" y="${h - r}" width="${w}" height="${r}"/></svg>`
  );
  const rounded = await sharp(shot)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();

  // No shadow by default.
  //
  // It went through a harsh version and a faint one before coming off
  // entirely. The posters are flat cut-paper with no cast shadows anywhere in
  // them, so any shadow under the screen was the one lit object in an unlit
  // illustration. The screen reads as sitting on the artwork from the overlap
  // alone. --screen-shadow puts it back if a particular poster needs it.
  const pad = Math.round(PW * 0.045);
  const shadow = opts.screenShadow
    ? await sharp({
        create: {
          width: w + pad * 2,
          height: h + pad,
          channels: 4,
          background: { r: 60, g: 52, b: 44, alpha: 0.1 },
        },
      })
        .blur(Math.max(1, Math.round(PW * 0.035)))
        .png()
        .toBuffer()
    : null;

  await sharp(artFile)
    .composite([
      ...(shadow
        ? [{ input: shadow, left: x - pad, top: y - Math.round(pad / 2) }]
        : []),
      { input: rounded, left: x, top: y },
    ])
    .png()
    .toFile(outFile);

  return { w, h, x, y };
}

/* ---------- measurement ---------- */

const hex = (r, g, b) =>
  "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();

/**
 * The poster's own background colour, and the row where its artwork stops.
 *
 * Both are means over a band, never a single pixel: the paper texture gives
 * 20-43 distinct values down any one edge, so one sample picks grain rather
 * than colour. Measured on the nine done by hand, the mean of the top 4.5% has
 * a median per-pixel deviation of 2-4, which is what makes it trustworthy.
 */
async function measure(file) {
  const { width: W, height: H } = await sharp(file).metadata();
  // removeAlpha so the stride is always 3 bytes: these PNGs carry an alpha
  // channel and indexing as RGB over RGBA reads garbage.
  const { data } = await sharp(file)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const at = (x, y) => {
    const i = (y * W + x) * 3;
    return [data[i], data[i + 1], data[i + 2]];
  };

  const meanBand = (y0, y1) => {
    let r = 0, g = 0, b = 0, n = 0;
    for (let y = y0; y < y1; y += 2)
      for (let x = 0; x < W; x += 2) {
        const [pr, pg, pb] = at(x, y);
        r += pr; g += pg; b += pb; n++;
      }
    return [r / n, g / n, b / n];
  };

  const bg = meanBand(0, Math.round(H * 0.045));
  const ground = meanBand(H - Math.round(H * 0.03), H);

  const near = (p, t) =>
    Math.abs(p[0] - t[0]) + Math.abs(p[1] - t[1]) + Math.abs(p[2] - t[2]) < 46;

  let lastContent = 0;
  for (let y = 0; y < H; y += 4) {
    let n = 0, seen = 0;
    for (let x = 0; x < W; x += 4) {
      const p = at(x, y);
      seen++;
      if (!near(p, bg) && !near(p, ground)) n++;
    }
    if ((n / seen) * 100 > 6) lastContent = y;
  }

  const contentEndPct = Math.round((lastContent / H) * 100);
  return {
    bg: hex(...bg),
    contentEndPct,
    // The band the case-page banner should show for "bottom": just inside where
    // the artwork actually stops, not the empty ground under it.
    suggestedBannerFocus: Math.max(0, Math.min(100, contentEndPct - 4)),
  };
}

/* ---------- wiring ---------- */

/** Adds the slug and its measured colour to lib/posters.ts, idempotently. */
async function wireUp(slug, bg) {
  let s = await readFile(POSTERS_TS, "utf8");
  let changed = false;

  if (!new RegExp(`^\\s*["']?${slug}["']?\\s*:`, "m").test(s)) {
    const key = /^[a-z][a-z0-9]*$/.test(slug) ? slug : `"${slug}"`;
    s = s.replace(
      /(const FLAT_POSTER_BG: Record<string, string> = \{\n)/,
      `$1  ${key}: "${bg}",\n`
    );
    changed = true;
  } else {
    s = s.replace(
      new RegExp(`(^\\s*["']?${slug}["']?\\s*:\\s*)"#[0-9A-Fa-f]{6}"`, "m"),
      `$1"${bg}"`
    );
    changed = true;
  }

  if (!new RegExp(`FLAT_POSTERS[\\s\\S]*?["']${slug}["']`).test(s)) {
    s = s.replace(
      /(const FLAT_POSTERS = new Set\(\[\n)/,
      `$1  "${slug}",\n`
    );
    changed = true;
  }

  if (changed) await writeFile(POSTERS_TS, s);
  return changed;
}

/* ---------- main ---------- */

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.slug) usage(args.slug ? null : "--slug is required.");

  const outFile = path.join(POSTERS_DIR, `${args.slug}.png`);

  const skipGenerate =
    args["measure-only"] || args.screen || args["no-screen"];
  if (!skipGenerate) {
    if (!args.subject) usage("--subject is required (or use --measure-only).");
    if (existsSync(outFile) && !args.force && !args["dry-run"]) {
      usage(`${outFile} already exists. Pass --force to overwrite.`);
    }

    const prompt = await buildPrompt(args);

    if (args["dry-run"]) {
      console.log(`\n--- prompt (${IMAGE_MODEL}, ${args.size}, ${args.quality}) ---\n`);
      console.log(prompt);
      console.log("\n--- dry run, nothing sent ---\n");
      return;
    }

    const key = await apiKey();
    console.log(`Generating ${args.slug} (${IMAGE_MODEL}, ${args.size}, ${args.quality})...`);
    const raw = await generate(key, prompt, args);

    await mkdir(POSTERS_DIR, { recursive: true });
    // Cover-crop to 4:5 whatever the API returned, anchored at the top: these
    // compositions resolve high in the frame and the foot is empty ground, so
    // losing height off the bottom costs nothing.
    await sharp(raw)
      .resize(TARGET_W, TARGET_H, { fit: "cover", position: "top" })
      .png()
      .toFile(artPath(args.slug));
    // The card starts as a copy of the artwork; --screen seats a shot into it.
    await sharp(artPath(args.slug)).png().toFile(outFile);
    console.log(`  wrote ${path.relative(ROOT, outFile)} (${TARGET_W}x${TARGET_H})`);

    // What produced this image, kept next to the script. Without it a revision
    // is guesswork: "make it less cramped" needs the original wording to amend.
    await mkdir(LOG_DIR, { recursive: true });
    await writeFile(
      path.join(LOG_DIR, `${args.slug}.md`),
      `# ${args.slug}\n\n` +
        `Generated ${new Date().toISOString()} · ${IMAGE_MODEL} · ${args.size} · ${args.quality}\n\n` +
        `## Subject\n\n${args.subject}\n\n` +
        (args.color ? `## Colour\n\n${args.color}\n\n` : "") +
        (args.notes ? `## Revision notes\n\n${args.notes}\n\n` : "") +
        `## Full prompt\n\n${prompt}\n`
    );
    console.log(`  logged the prompt to ${path.relative(ROOT, path.join(LOG_DIR, `${args.slug}.md`))}`);
  }

  if (!existsSync(outFile)) usage(`No poster at ${outFile}.`);

  // An older poster predates the art/card split: adopt it as the artwork so
  // compositing has something untouched to work from.
  if (!existsSync(artPath(args.slug))) {
    await sharp(outFile).png().toFile(artPath(args.slug));
    console.log(`  kept the current image as ${args.slug}-art.png`);
  }

  if (args["no-screen"]) {
    await sharp(artPath(args.slug)).png().toFile(outFile);
    console.log("  rebuilt the card from artwork alone, no screenshot");
  } else if (args.screen) {
    const shot = path.isAbsolute(args.screen)
      ? args.screen
      : path.join(ROOT, args.screen);
    if (!existsSync(shot)) usage(`No screenshot at ${shot}.`);
    const box = await seatScreen(artPath(args.slug), shot, outFile, {
      screenWidth: args["screen-width"],
      screenTop: args["screen-top"],
      screenX: args["screen-x"],
      screenShadow: args["screen-shadow"],
    });
    console.log(
      `  seated ${path.basename(shot)} at ${box.w}x${box.h}, ${box.x},${box.y}`
    );
  }

  const m = await measure(outFile);
  console.log(`  background ${m.bg}`);
  console.log(`  artwork ends at ${m.contentEndPct}%`);

  const wired = await wireUp(args.slug, m.bg);
  console.log(wired ? "  updated lib/posters.ts" : "  lib/posters.ts already current");

  console.log(`\nNext:
  - check it on the card and the case page
  - if the banner's crop is wrong, set Banner focal point in the Studio${
    m.suggestedBannerFocus < 80 ? ` (try ${m.suggestedBannerFocus})` : ""
  }
  - the project needs a Sanity document to appear at all\n`);
}

main().catch((err) => {
  console.error(`\n  ${err.message}\n`);
  process.exit(1);
});
