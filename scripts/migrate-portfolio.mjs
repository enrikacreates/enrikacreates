/**
 * Content migration — seeds Sanity with the legacy PORTFOLIO array.
 *
 * MIGRATION TEMPLATE NOTE:
 *   Reusable pattern for any vanilla→Sanity port:
 *   1. Read the legacy data array (here inlined; could import from a JSON file)
 *   2. Upload each local image to Sanity's asset store (deduped by filename)
 *   3. Build documents referencing the uploaded asset _ids
 *   4. createOrReplace with deterministic _ids so re-running is idempotent
 *
 *   Run: `node scripts/migrate-portfolio.mjs`
 *   Requires SANITY_API_WRITE_TOKEN in .env.local.
 */

import { createClient } from "@sanity/client";
import { createReadStream, existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// --- Load env from .env.local ---
const envText = await readFile(path.join(ROOT, ".env.local"), "utf8");
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
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-12-01",
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

/* ---------- Legacy data (copied from vanilla script.js PORTFOLIO) ---------- */
const PORTFOLIO = [
  { title: "Modern Tribe Clothing", category: "fashion", color: "#FC7F5A", year: "2024", tagline: "Heritage prints, modern silhouettes", image: "" },
  {
    title: "3D Pattern Design Collection", category: "fashion", color: "#3498CE", year: "2026",
    tagline: "Textile patterns for daily wear",
    image: "/assets/patterndesigns/CoverColorBlockAfroPrintDressImg.png",
    slides: ["/assets/patterndesigns/1.png", "/assets/patterndesigns/2.png", "/assets/patterndesigns/3.png", "/assets/patterndesigns/4.png"],
    skills: ["CLO3D", "Surface Design", "Pattern Design", "Production Mgt."],
    galleryIntro: "From inspiration to design fabrication.",
    gallery: [
      { src: "/assets/gallery_patterndesigncollection/IMG_3740.JPG", caption: "Full bodice silhouette test" },
      { src: "/assets/gallery_patterndesigncollection/IMG_4819.JPG", caption: "Miniature silhouette test: barrel skirt, long puff sleeve" },
      { src: "/assets/gallery_patterndesigncollection/IMG_4917.JPG", caption: "Full dress sizing" },
      { src: "/assets/gallery_patterndesigncollection/bluedress3Dwork.png", caption: "CLO3D pattern construction & 3D drape" },
      { src: "/assets/gallery_patterndesigncollection/IMG_4920.JPG", caption: "Custom surface design dye treatment test" },
      { src: "/assets/gallery_patterndesigncollection/IMG_4925.JPG", caption: "Custom surface design dye treatment test" },
    ],
    story: {
      oneline: "Three handmade garments designed in 3D from sketch to stitch.",
      challenge: "Bridge the gap between digital pattern design and handmade fashion craft. Each piece needed to translate cleanly from 3D plan to wearable garment.",
      action: "Built each piece in 3D pattern software with full measurements, printed sample patterns, then printed, sewn, and fitted the final pieces by hand.",
      result: "Four completed pieces — an afro-print dress, barrel pants with build-up linen blouse, and a black cowl-sleeve blouse — proven from concept to wardrobe.",
    },
  },
  { title: "Textile Explorations", category: "fashion", color: "#F7B5B1", year: "2023", tagline: "Hand-dyed fabric studies", image: "" },
  { title: "Woven Stories Series", category: "fashion", color: "#7A8B6A", year: "2022", tagline: "Stories you can wear", image: "" },
  { title: "What Is Love", category: "product", color: "#3498CE", year: "2025", tagline: "Conversation card deck", image: "" },
  { title: "SignatureStyle", category: "apps", color: "#FC7F5A", year: "2026", tagline: "Personal style OS", image: "" },
  { title: "GoGoMagic List", category: "apps", color: "#F2C052", year: "2025", tagline: "Lists you actually use", image: "" },
  { title: "StoryKeepr", category: "apps", color: "#F7B5B1", year: "2026", tagline: "Memory vault for your stories", image: "" },
  { title: "Workshop Blocks", category: "apps", color: "#3498CE", year: "2025", tagline: "Plan workshops in blocks", image: "" },
  { title: "Speak Up", category: "apps", color: "#0F2A44", year: "2026", tagline: "Voice training, daily", image: "" },
  { title: "Enrika Creates", category: "web", color: "#F2C052", year: "2026", tagline: "This very site", image: "" },
  { title: "Small Gorilla Site", category: "web", color: "#7A8B6A", year: "2024", tagline: "Studio site + portfolio", image: "" },
  { title: "Creative Entrepreneur Summit", category: "event", color: "#FC7F5A", year: "2024", tagline: "A day for makers + sellers", image: "" },
  { title: "Pattern Design Workshop", category: "event", color: "#3498CE", year: "2023", tagline: "Hands-on print studio", image: "" },
  { title: "Storytelling Experience", category: "event", color: "#F7B5B1", year: "2024", tagline: "An evening of voices", image: "" },
  { title: "Notes to Self", category: "writing", color: "#F2C052", year: "2026", tagline: "Weekly newsletter on creative living" },
  { title: "The Storytelling Edge", category: "writing", color: "#3498CE", year: "2025", tagline: "Field notes for makers" },
  { title: "How to Begin", category: "writing", color: "#FC7F5A", year: "2026", tagline: "Forthcoming book — creative starts" },
  { title: "Small Gorilla Letters", category: "writing", color: "#7A8B6A", year: "2024", tagline: "Studio dispatches" },
  { title: "On Hope, Daily", category: "writing", color: "#F7B5B1", year: "2026", tagline: "Forthcoming book — practice of hope" },
];

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

// Cache uploaded assets by local path so we never upload the same file twice.
const assetCache = new Map();
async function uploadImage(localPath) {
  if (!localPath) return null;
  if (assetCache.has(localPath)) return assetCache.get(localPath);
  const filePath = path.join(ROOT, "public", localPath.replace(/^\//, ""));
  if (!existsSync(filePath)) {
    console.warn(`  ⚠ missing: ${localPath}`);
    return null;
  }
  const asset = await client.assets.upload("image", createReadStream(filePath), {
    filename: path.basename(filePath),
  });
  const ref = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  assetCache.set(localPath, ref);
  return ref;
}

async function migrate() {
  console.log(`Migrating ${PORTFOLIO.length} projects → ${env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${env.NEXT_PUBLIC_SANITY_DATASET}\n`);

  for (let i = 0; i < PORTFOLIO.length; i++) {
    const p = PORTFOLIO[i];
    const slug = slugify(p.title);
    console.log(`[${i + 1}/${PORTFOLIO.length}] ${p.title}`);

    const leadImage = await uploadImage(p.image);

    const slides = [];
    for (const src of p.slides || []) {
      const image = await uploadImage(src);
      if (image) slides.push({ _type: "slide", _key: `slide-${slides.length}`, image, alt: `${p.title} design` });
    }

    const gallery = [];
    for (const g of p.gallery || []) {
      const image = await uploadImage(g.src);
      if (image) gallery.push({ _type: "galleryItem", _key: `gal-${gallery.length}`, image, caption: g.caption || "" });
    }

    const doc = {
      _id: `project-${slug}`,
      _type: "project",
      title: p.title,
      slug: { _type: "slug", current: slug },
      category: p.category,
      color: p.color,
      year: p.year,
      tagline: p.tagline || "",
      featured: ["3d-pattern-design-collection", "what-is-love", "small-gorilla-site"].includes(slug),
      displayOrder: i * 10,
      publishedAt: new Date(`${p.year}-01-01`).toISOString(),
      ...(leadImage ? { leadImage } : {}),
      ...(p.story?.oneline ? { oneline: p.story.oneline } : {}),
      ...(p.story?.challenge ? { challenge: p.story.challenge } : {}),
      ...(p.story?.action ? { action: p.story.action } : {}),
      ...(p.story?.result ? { result: p.story.result } : {}),
      ...(p.galleryIntro ? { galleryIntro: p.galleryIntro } : {}),
      ...(p.skills ? { skills: p.skills } : {}),
      ...(slides.length ? { slides } : {}),
      ...(gallery.length ? { gallery } : {}),
    };

    await client.createOrReplace(doc);
    console.log(`  ✓ ${slug}${leadImage ? " (+image)" : ""}${slides.length ? ` +${slides.length} slides` : ""}${gallery.length ? ` +${gallery.length} gallery` : ""}`);
  }

  console.log("\n✅ Migration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
