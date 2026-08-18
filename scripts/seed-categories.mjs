/**
 * Seed the `category` documents and migrate `project.category` from the old
 * plain string to a reference.
 *
 * Two passes, both idempotent, safe to re-run:
 *
 *   1. Create the six categories with deterministic ids (`category-<slug>`).
 *      Uses createIfNotExists, so editing a title, blurb, order, or the
 *      "Show publicly" toggle in the Studio survives a re-run. Pass --force to
 *      overwrite them back to the values below.
 *
 *   2. Rewrite every project whose `category` is still a string into a
 *      reference to the matching document. Projects already migrated are left
 *      alone, so this is a no-op on the second run.
 *
 * Usage:
 *   node scripts/seed-categories.mjs
 *   node scripts/seed-categories.mjs --force   # reset category docs to defaults
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

const FORCE = process.argv.includes("--force");

/**
 * `listed: true` puts a category in the filter bar, the sitemap, and search
 * results. Everything else stays live at its own URL and inside /all, but out
 * of the public read. Mobile and web are public because they're the work a
 * product design role is hiring for.
 */
const CATEGORIES = [
  {
    slug: "mobile",
    title: "Mobile",
    listed: true,
    order: 10,
    color: "#3498CE",
    blurb:
      "App products designed phone-first and built end to end. One is native (Expo/React Native), the rest are installable web apps.",
  },
  {
    slug: "web",
    title: "Web",
    listed: true,
    order: 20,
    color: "#7FA481",
    blurb: "Product and marketing sites, designed and built with a CMS the client can actually run.",
  },
  {
    slug: "product",
    title: "Product",
    listed: false,
    order: 30,
    color: "#FC7F5A",
    blurb: "Physical products and objects, from concept through production.",
  },
  {
    slug: "fashion",
    title: "Fashion",
    listed: false,
    order: 40,
    color: "#F7B5B1",
    blurb: "Garment and textile design, patterned and prototyped in 3D.",
  },
  {
    slug: "events",
    title: "Events",
    listed: false,
    order: 50,
    color: "#E8B84A",
    blurb: "Gatherings and workshops designed as experiences, not agendas.",
  },
  {
    slug: "writing",
    title: "Writing",
    listed: false,
    order: 60,
    color: "#2C2520",
    blurb: "Essays, letters, and the long-running practice behind the rest of the work.",
  },
];

/** Legacy `project.category` string values that changed name. */
const LEGACY_CATEGORY_SLUGS = {
  apps: "mobile",
  event: "events",
};

const categoryId = (slug) => `category-${slug}`;

/* ---------- Pass 1: the category documents ---------- */

console.log(
  `Seeding ${CATEGORIES.length} categories → ${env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${env.NEXT_PUBLIC_SANITY_DATASET}` +
    (FORCE ? "  (--force: overwriting)" : "") +
    "\n"
);

for (const c of CATEGORIES) {
  const doc = {
    _id: categoryId(c.slug),
    _type: "category",
    title: c.title,
    slug: { _type: "slug", current: c.slug },
    listed: c.listed,
    order: c.order,
    blurb: c.blurb,
    color: c.color,
  };

  if (FORCE) {
    await client.createOrReplace(doc);
    console.log(`  ✓ ${c.title.padEnd(9)} /${c.slug.padEnd(8)} ${c.listed ? "public" : "hidden"}  (replaced)`);
  } else {
    await client.createIfNotExists(doc);
    console.log(`  ✓ ${c.title.padEnd(9)} /${c.slug.padEnd(8)} ${c.listed ? "public" : "hidden"}`);
  }
}

/* ---------- Pass 2: point projects at them ---------- */

const projects = await client.fetch(
  `*[_type == "project"]{ _id, title, category }`
);

// A migrated project has an object here ({_ref, _type}); a legacy one has a
// string. Anything else means the field was never set.
const pending = projects.filter((p) => typeof p.category === "string");

console.log(
  `\n${projects.length} projects, ${pending.length} still on the old string field.`
);

if (pending.length === 0) {
  console.log("Nothing to migrate.");
} else {
  const known = new Set(CATEGORIES.map((c) => c.slug));
  let migrated = 0;
  const unmatched = [];

  for (const p of pending) {
    const slug = LEGACY_CATEGORY_SLUGS[p.category] ?? p.category;

    if (!known.has(slug)) {
      unmatched.push(`${p.title} (category "${p.category}")`);
      continue;
    }

    await client
      .patch(p._id)
      .set({ category: { _type: "reference", _ref: categoryId(slug) } })
      .commit();

    migrated++;
    console.log(`  ✓ ${p.title.padEnd(34)} ${p.category} → ${slug}`);
  }

  console.log(`\n${migrated} migrated.`);

  if (unmatched.length) {
    console.log(
      `\n⚠ ${unmatched.length} project(s) had a category with no matching document. ` +
        `Set these by hand in the Studio:`
    );
    unmatched.forEach((u) => console.log(`    - ${u}`));
  }
}

console.log("\n✅ Categories seeded.");
