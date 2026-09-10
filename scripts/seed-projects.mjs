/**
 * Seed the first real case studies so the portfolio is usable now.
 *
 * These five are the strongest current evidence of product design and build:
 * one native app, three web products, and one client site. Each gets the full
 * story shape the detail page renders (oneline, challenge, action, result,
 * skills) so /mobile and /web aren't rows of empty stubs.
 *
 * Idempotent. Projects are keyed by deterministic `_id`, and the script only
 * ever `set`s the story fields listed in `STORY_FIELDS`. Everything else
 * (images, slides, gallery, color, tagline) is left exactly as it is in the
 * Studio, so re-running never undoes hand-editing or wipes uploaded media.
 *
 * Images are deliberately not seeded: lead images and process galleries are
 * uploaded through the Studio, where the hotspot can be set by eye.
 *
 * Prerequisite: node scripts/seed-categories.mjs
 *
 * Usage:
 *   node scripts/seed-projects.mjs
 *   node scripts/seed-projects.mjs --dry   # print what would change
 */

import { createClient } from "@sanity/client";
import { readFile } from "node:fs/promises";

const envText = await readFile(".env.local", "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-12-01",
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const DRY = process.argv.includes("--dry");

/** Fields this script owns. Anything not listed here is never touched. */
const STORY_FIELDS = [
  "title",
  "slug",
  "category",
  "year",
  "tagline",
  "color",
  "oneline",
  "challenge",
  "action",
  "result",
  "skills",
  "signals",
  "featured",
  "displayOrder",
];

const ref = (slug) => ({ _type: "reference", _ref: `category-${slug}` });

const PROJECTS = [
  {
    _id: "project-hummingbird",
    signals: ["Native app", "iOS", "Audio capture"],
    slug: "hummingbird",
    title: "Hummingbird",
    category: "mobile",
    year: "2026",
    color: "#FC7F5A",
    featured: true,
    displayOrder: 1,
    tagline: "A vibe catcher for new song ideas",
    oneline:
      "A songwriting app built for the fragments: the line that arrives at a bus stop, kept until it grows into a song.",
    challenge:
      "Songwriters lose more ideas than they finish. A hook arrives somewhere inconvenient, it goes into the phone's voice memos, and it joins two hundred other untitled recordings that no one will ever play back. The problem isn't recording, every phone does that. The problem is that a captured fragment has nowhere to live and no way to be found again, so capture and craft stay disconnected.",
    action:
      "I designed and built Hummingbird as a native app in Expo and React Native, with capture as the first screen rather than a feature buried in a menu. One tap takes an audio scrap or a lyric fragment. From there the app is built to help a fragment grow: Sparks for loose ideas, a lyric workspace, chord tooling driven by a chords database and music-theory helpers, Places so an idea keeps the location it arrived in, and an immersive writing mode that strips the interface back when it is time to actually write. Vibe Search lets you find your way back in by feel instead of by filename. On the back end it shares an existing Supabase project using prefixed tables, keeps audio in Cloudflare R2, and routes image search through a Cloudflare Worker so no API key ever ships inside the app bundle.",
    result:
      "The app is in active development and running on device. The design bet it proves out is the ordering: making capture the home screen, and treating search as recall by feel rather than by name, keeps fragments in circulation instead of letting them sink. The shared-backend approach also brought the running cost of another app to near zero, which is what makes a portfolio of small products practical to maintain solo.",
    skills: [
      "Product Design",
      "React Native",
      "Expo",
      "Supabase",
      "Cloudflare R2",
      "Audio UX",
    ],
  },

  {
    _id: "project-betterstories",
    signals: ["Web app", "Screen + camera recording", "No signup"],
    slug: "betterstories",
    title: "betterstories.tech",
    category: "web",
    year: "2026",
    color: "#3498CE",
    featured: true,
    displayOrder: 2,
    tagline: "Async usability testing, no scheduling",
    oneline:
      "Makers post a task, real people record screen and camera on their own time, and the replays are waiting the next morning.",
    challenge:
      "Moderated usability testing is the thing small teams know they should do and almost never do. Every session costs a calendar invite, a facilitator sitting through it live, and a participant recruited and paid. So the research either doesn't happen, or it happens once before launch and never again. What was missing was a way to watch a real person struggle with your product without anyone having to be in the room.",
    action:
      "I designed and built betterstories as a Next.js app around one hard technical piece: the recorder composites the participant's shared screen with their camera as a circular picture-in-picture onto a single canvas, mixes microphone and tab audio, and records that as one stream, so the maker gets a single clip instead of files to reassemble. Three test types cover different questions: a task test for behaviour, a three-second test for first impressions, and an open opinion question. Delivery matters as much as capture, so a test ships either as a hosted link or as a one-line embed script that fires an invite popup on the maker's own live site, rendered in a Shadow DOM so it can never inherit or break the host page's styles, with page targeting and a per-visitor frequency cap so it asks once and never nags. Participants stay anonymous with no signup, and recordings upload straight to object storage.",
    result:
      "The embed is the part that changes the practice rather than just the tooling: because the invite fires on real traffic, the people being tested are actual visitors with genuine intent, not recruited participants performing a task. Feedback is tagged against one shared vocabulary across every test, so signals accumulate into themes over time instead of sitting in unconnected session recordings.",
    skills: [
      "Product Design",
      "Next.js",
      "MediaRecorder API",
      "Canvas Compositing",
      "Supabase",
      "Cloudflare R2",
    ],
  },

  {
    _id: "project-50-states-of-freedom",
    signals: ["Client site", "Sanity CMS", "Client-run"],
    slug: "50-states-of-freedom",
    title: "50 States of Freedom",
    category: "web",
    year: "2026",
    color: "#7FA481",
    featured: true,
    displayOrder: 3,
    tagline: "A heritage travel guide that powers a vision",
    oneline:
      "A fifty-state guide to Black heritage travel, structured so the client keeps publishing without ever needing a developer.",
    challenge:
      "The client had done the hard part, years of research into heritage sites across all fifty states, and had nowhere to put it. The real risk in a project like this isn't the launch, it's month four: a beautiful site that quietly goes stale because every update means emailing whoever built it. The site had to be handed over in a state where the client could keep it alive alone.",
    action:
      "I designed and built the site in Next.js with Sanity as the CMS, and spent most of the modelling effort on the content structure rather than the pages. States, sites, and stories are separate document types with real relationships, so the client adds a location and it appears everywhere it belongs without touching a layout. Forms run through Tally so response handling never becomes a maintenance burden, and the whole thing deploys on Vercel straight from the repository. Editors get a Studio shaped around the way the content is actually organised, not a flat list of everything.",
    result:
      "Live and handed over, with the client publishing new entries themselves. The content model is the deliverable that matters: because the structure matches how the research is organised in the client's head, adding to the site feels like adding to their notes rather than operating a tool.",
    skills: [
      "Content Modelling",
      "Next.js",
      "Sanity CMS",
      "Vercel",
      "Client Delivery",
    ],
  },

  {
    _id: "project-create-space-collective",
    signals: ["Web app", "Membership", "Community"],
    slug: "create-space-collective",
    title: "Create Space Collective",
    category: "web",
    year: "2026",
    // Pink, matching Create Space's own --color-accent #F5C7C7. Gold moved to
    // DeeplyReader, whose mustard #e1bd32 owns that end of the palette.
    color: "#F7B5B1",
    featured: false,
    displayOrder: 4,
    tagline: "A membership space for people who make things",
    oneline:
      "A creative community built around three pillars: kits and challenges, making live together, and sharpening the work before sharing it wide.",
    challenge:
      "Most creative communities are a feed and a chat room, which is why most of them go quiet. People arrive wanting to make something and are handed somewhere to talk about making something instead. The design problem was structural, not cosmetic: the space needed to be organised around the act of making, so that showing up has an obvious thing to do rather than a timeline to scroll.",
    action:
      "I set the product architecture on three pillars, each with a locked definition so features could be tested against it, then designed the space as rooms rather than tabs: a studio, a living room, a made-it wall, show and tell, challenges, collabs, and a timebox for working to a clock. It's built in Next.js with Tailwind, with the design tokens defined once in a single stylesheet so the visual system stays coherent across every zone. The visual signature is hand-drawn single-weight line icons, one per item and semantically matched to what it actually is, which keeps a community product feeling made rather than assembled from a component library.",
    result:
      "In build ahead of launch. The three-pillar structure has already earned its keep as a design constraint: it is the thing that settles arguments about what belongs in the product, and several tempting features have been cut against it because they served conversation rather than making.",
    skills: [
      "Product Strategy",
      "Design Systems",
      "Next.js",
      "Tailwind CSS",
      "Illustration",
    ],
  },

  {
    _id: "project-signaturestyle",
    signals: ["Web app", "Installable", "Personal library"],
    slug: "signaturestyle",
    title: "SignatureStyle",
    category: "mobile",
    year: "2026",
    color: "#FC7F5A",
    featured: false,
    displayOrder: 5,
    tagline: "A wardrobe organised by identity",
    oneline:
      "A personal style app organised around who you are, not around what kind of garment something is.",
    challenge:
      "Wardrobe apps sort by category: tops, shoes, outerwear. That mirrors how a shop is arranged, not how anyone actually decides what to wear, and it quietly turns every app into a shopping prompt. Getting dressed is an identity decision before it is a garment decision, and no tool was modelling it that way.",
    action:
      "I designed the app around user-defined style archetypes instead of fixed garment types, so people name their own modes and map real wardrobe pieces, outfits, and inspiration images onto them. It's built in React and TypeScript on Vite, with data in an isolated Postgres schema on a shared Supabase project and images compressed to webp in the browser before upload so the storage footprint stays small. The interface follows a strict design rule of no borders or outlines anywhere, depth carried entirely by shadow, which keeps a dense visual grid of clothing readable without adding lines that compete with the garments themselves.",
    result:
      "The identity-first model changes what the app is for. Because categories are the user's own language rather than retail taxonomy, the natural next action is to combine what you already own instead of to fill a gap, which is the opposite of what wardrobe apps usually optimise for.",
    skills: [
      "Product Design",
      "React",
      "TypeScript",
      "Supabase",
      "Design Systems",
    ],
  },

  /* ------------------------------------------------------------------
   * The four below were added to give the remaining posters somewhere to
   * live. Their story prose is drafted from what each repository actually
   * contains (stack, routes, features), so it is accurate about the build.
   * Anything that needs Enrika's own account, the motivation behind a
   * project and what it went on to prove, is left blank rather than
   * invented. Fill those in the Studio.
   * ------------------------------------------------------------------ */

  {
    _id: "project-deeplyreader",
    signals: ["Chrome extension", "Web reader", "On-device"],
    slug: "deeplyreader",
    title: "DeeplyReader",
    // Sits awkwardly in the taxonomy: it's an app product, not a site, but it
    // is browser-first rather than phone-first. Move it to mobile if the
    // Mobile blurb widens.
    category: "web",
    year: "2026",
    // Gold, matching the app's own --mustard #e1bd32, which with teal is the
    // pair the product is actually built on. It was ink, but a near-black card
    // sat apart from the cream-and-colour treatment every other card uses.
    color: "#E8B84A",
    featured: false,
    displayOrder: 6,
    tagline: "Read anything aloud, on the web or off it",
    oneline:
      "A text-to-speech reader in two halves: a browser extension for whatever is on screen, and a longform reader for the books you already own.",
    action:
      "I built it as two front ends over one backend. A Chrome MV3 extension (WXT) reads web pages, selected text, images, and screenshots, including Kindle in the browser. A separate Vite and React reader handles longform PDF and EPUB, keeping books on-device in IndexedDB so a personal library never leaves the machine. Both call the same Supabase Edge Functions for OpenAI text-to-speech, which keeps the API key server-side and means one voice pipeline serves both surfaces instead of two implementations drifting apart.",
    skills: [
      "Product Design",
      "Chrome Extensions",
      "React",
      "Supabase Edge Functions",
      "IndexedDB",
      "Text to Speech",
    ],
  },

  {
    _id: "project-workshopblocks",
    slug: "workshopblocks",
    title: "Workshop Blocks",
    category: "mobile",
    year: "2026",
    color: "#E8B84A",
    featured: false,
    displayOrder: 7,
    tagline: "Build a workshop out of pieces you already trust",
    oneline:
      "A workshop builder for facilitators: assemble a session from reusable blocks, then run it from a live run sheet.",
    action:
      "I designed and built it in React and TypeScript on Vite with Supabase behind it. The model separates a block library, the reusable exercises and segments, from the workshops assembled out of them, so improving a block improves every session that uses it. Building a session is drag and drop (dnd-kit), and the same session has a second face: a run sheet for the day itself, timed and ordered, rather than the builder view a facilitator would have to reinterpret while standing in front of a room. Locations and a resources library sit alongside, so the material a session needs travels with it.",
    skills: [
      "Product Design",
      "React",
      "TypeScript",
      "Supabase",
      "Drag and Drop UX",
    ],
  },

  {
    _id: "project-visionmap",
    slug: "visionmap",
    title: "Visionmap.coach",
    category: "web",
    year: "2026",
    color: "#7FA481",
    featured: false,
    displayOrder: 8,
    tagline: "A coaching practice with an AI-assisted spine",
    oneline:
      "A coaching site and product built on a self-hosted CMS, with Claude wired in rather than bolted on.",
    action:
      "Built in Next.js on Payload CMS with Postgres, Lexical rich text, and S3-backed media, so the content model and the application are one codebase rather than a site plus a separate headless service. Page composition is block-based, which keeps new page types an editorial act instead of a deploy. The Anthropic SDK is integrated server-side, and Framer Motion carries the interaction detail.",
    skills: [
      "Product Design",
      "Next.js",
      "Payload CMS",
      "PostgreSQL",
      "Anthropic API",
    ],
  },

  {
    _id: "project-bernadettejiwa",
    slug: "bernadettejiwa",
    title: "BernadetteJiwa.com",
    category: "web",
    year: "2026",
    color: "#F7B5B1",
    featured: false,
    displayOrder: 9,
    tagline: "An author site her books can actually run",
    oneline:
      "A bestselling author's site moved off a page builder and onto a content model shaped around her books.",
    challenge:
      "The site was on Carrd, which is fine until the content has structure. An author's site is really a catalogue: books, each with editions, links, endorsements, and a place in a body of work. On a page builder every one of those is hand-placed, so adding a book means rebuilding a page, and nothing about one book knows anything about another.",
    action:
      "I rebuilt it in Next.js with Sanity, and modelled books as first-class documents rather than as page sections. Adding a title creates the entry once and it appears everywhere it belongs. Deployment runs on Vercel straight from the repository.",
    skills: ["Content Modelling", "Next.js", "Sanity CMS", "Vercel", "Client Delivery"],
  },
];

/* ---------- Write ---------- */

console.log(
  `Seeding ${PROJECTS.length} case studies → ${env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${env.NEXT_PUBLIC_SANITY_DATASET}` +
    (DRY ? "  (--dry: no writes)" : "") +
    "\n"
);

// Categories must exist first, otherwise the references dangle.
const missing = [];
for (const slug of new Set(PROJECTS.map((p) => p.category))) {
  const exists = await client.fetch(`count(*[_id == $id]) > 0`, {
    id: `category-${slug}`,
  });
  if (!exists) missing.push(slug);
}
if (missing.length) {
  console.error(
    `✗ Missing categories: ${missing.join(", ")}.\n` +
      `  Run: node scripts/seed-categories.mjs`
  );
  process.exit(1);
}

for (const p of PROJECTS) {
  const fields = {
    title: p.title,
    slug: { _type: "slug", current: p.slug },
    category: ref(p.category),
    year: p.year,
    tagline: p.tagline,
    color: p.color,
    oneline: p.oneline,
    challenge: p.challenge,
    action: p.action,
    result: p.result,
    skills: p.skills,
    signals: p.signals,
    featured: p.featured,
    displayOrder: p.displayOrder,
  };

  // Drop keys the entry didn't define. Some projects are seeded with metadata
  // and a one-liner only, because the case-study prose needs Enrika's own
  // account rather than an inferred one; `set` with undefined would fail, and
  // writing a placeholder would put invented claims on a hiring portfolio.
  for (const k of Object.keys(fields)) {
    if (fields[k] === undefined) delete fields[k];
  }

  if (DRY) {
    const missing = STORY_FIELDS.filter((f) => fields[f] === undefined);
    console.log(
      `  · ${p.title.padEnd(24)} ${p.category.padEnd(7)} would set ${Object.keys(fields).length} fields` +
        (missing.length ? `  (blank: ${missing.join(", ")})` : "")
    );
    continue;
  }

  // createIfNotExists then patch: creates the doc when it's new, and updates
  // only the story fields when it already exists, so uploaded media survives.
  await client.createIfNotExists({ _id: p._id, _type: "project", ...fields });
  await client.patch(p._id).set(fields).commit();

  console.log(`  ✓ ${p.title.padEnd(24)} ${p.category.padEnd(7)} /work/${p.slug}`);
}

console.log(
  DRY
    ? "\nDry run complete."
    : "\n✅ Case studies seeded. Add lead images and process galleries in the Studio."
);
