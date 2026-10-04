/**
 * Project — a portfolio entry (the "work" cards on /, /mobile, /web, /all, and
 * the detail page at /work/[slug]).
 *
 * MIGRATION TEMPLATE NOTE:
 *   This schema maps 1:1 to the legacy PORTFOLIO array shape from script.js,
 *   so the migration script in Phase 4 can copy fields directly.
 *
 *   Field groups keep the form scannable in the Studio — Details / Story /
 *   Media / Skills are collapsed sections, not nested objects.
 */

import { defineType, defineField } from "sanity";
import { brandColorOptions } from "../objects/brandColor";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",

  groups: [
    { name: "details", title: "Details", default: true },
    { name: "story", title: "Story" },
    { name: "media", title: "Designs & Process" },
    { name: "meta", title: "Display & SEO" },
  ],

  fields: [
    /* ---------- Details ---------- */
    defineField({
      name: "title",
      title: "Project title",
      type: "string",
      group: "details",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "details",
      description: "URL path: enrikacreates.com/work/[slug]",
      options: { source: "title", maxLength: 80 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      group: "details",
      to: [{ type: "category" }],
      description:
        "Which section this project belongs to. Manage the list itself under " +
        "Categories, including whether a category is shown publicly.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      group: "details",
      description: "Display year (string so '2026' renders cleanly).",
      validation: (Rule) =>
        Rule.required().regex(/^\d{4}$/, { name: "year", invert: false }),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "details",
      description: "One-line summary shown on the card (e.g. 'Textile patterns for daily wear').",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "color",
      title: "Card color",
      type: "string",
      group: "details",
      description:
        "The brand color used as the card background AND the detail page hero.",
      options: { list: brandColorOptions, layout: "radio", direction: "horizontal" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "signals",
      title: "Type signals",
      type: "array",
      group: "details",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description:
        "Two to four short markers of WHAT this is, shown under the card: 'Web app', 'iOS', 'Chrome extension', 'Client site'. These answer the question a card can't otherwise answer at a glance, which is what kind of thing you're looking at. Not the same as Skills: skills are what you did, signals are what it is.",
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: "leadImage",
      title: "Lead image",
      type: "image",
      group: "details",
      description:
        "Cover image — appears in the circular crop on the card and on the detail page hero. Hotspot lets you pick the focal point.",
      options: { hotspot: true },
    }),

    /* ---------- Story ---------- */
    defineField({
      name: "oneline",
      title: "One-line story",
      type: "text",
      group: "story",
      rows: 2,
      description:
        "The lead sentence on the detail page, set in italic Playfair (e.g. 'Three handmade garments designed in 3D from sketch to stitch.').",
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: "challenge",
      title: "Challenge",
      type: "text",
      group: "story",
      rows: 4,
    }),
    defineField({
      name: "action",
      title: "Action",
      type: "text",
      group: "story",
      rows: 4,
    }),
    defineField({
      name: "result",
      title: "Result",
      type: "text",
      group: "story",
      rows: 4,
    }),
    defineField({
      name: "process",
      title: "Research & process",
      type: "array",
      group: "story",
      of: [{ type: "processStep" }],
      description:
        "The middle of the story: what you looked at, what it told you, and what changed because of it. Challenge and Result say where the work started and landed; this says how you got between them, which is the part a hiring manager is actually reading for. Order is the order it renders.",
    }),

    /* ---------- Media ---------- */
    defineField({
      name: "keyScreens",
      title: "Key screens",
      type: "array",
      group: "media",
      of: [{ type: "galleryItem" }],
      description:
        "The two or three screens that carry the whole product. These render as a strip at the very TOP of the project page, above the written story, so someone scanning the page sees what the thing looks like before they read a word. Keep it short: this is the hook, not the tour. Everything else belongs in the slideshow below.",
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: "slides",
      title: "Designs slideshow",
      type: "array",
      group: "media",
      of: [{ type: "slide" }],
      description:
        "Polished design renders / mockups. Shown in the 'Designs' slideshow.",
    }),
    defineField({
      name: "galleryIntro",
      title: "Process intro line",
      type: "string",
      group: "media",
      description:
        "Optional sentence shown under 'Process' (e.g. 'From inspiration to design fabrication.').",
      validation: (Rule) => Rule.max(140),
    }),
    defineField({
      name: "gallery",
      title: "Process gallery",
      type: "array",
      group: "media",
      of: [{ type: "galleryItem" }],
      description:
        "Real photos of the work-in-progress. Shown as a captioned grid below the slideshow.",
    }),
    defineField({
      name: "skills",
      title: "Skills",
      type: "array",
      group: "media",
      of: [{ type: "string" }],
      description:
        "Skill chips shown between the Result section and the slideshow (e.g. CLO3D, Surface Design).",
      options: { layout: "tags" },
    }),

    /* ---------- Display & SEO ---------- */
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      group: "meta",
      description:
        "If true, shows in the 'Featured' row above the catalog grid on /.",
      initialValue: false,
    }),
    defineField({
      name: "caseUrl",
      title: "Case study link",
      type: "string",
      group: "meta",
      description:
        "Optional. Where the 'read / download the case' chip points. Leave blank and it uses the deck at /case/<slug> if one exists. A .pdf link becomes a download; anything else opens in a new tab.",
    }),
    defineField({
      name: "bannerAlign",
      title: "Banner crop",
      type: "string",
      group: "meta",
      description:
        "Which part of the poster the thin banner at the top of the case page shows. Centre suits most. Use Bottom when the middle of the poster repeats the first screenshot underneath it, or Top to lead with the poster's sky.",
      options: {
        list: [
          { title: "Top", value: "top" },
          { title: "Centre", value: "center" },
          { title: "Bottom", value: "bottom" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "center",
    }),
    defineField({
      name: "bannerFocus",
      title: "Banner focal point (%)",
      type: "number",
      group: "meta",
      description:
        "Optional. Overrides the choice above with an exact band: 0 is the very top of the poster, 100 the very bottom. Useful when the part you want sits between the presets. The posters run out of artwork around 84% and are empty cream below that, so values past ~80 tend to show nothing.",
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: "displayOrder",
      title: "Display order",
      type: "number",
      group: "meta",
      description:
        "Lower numbers appear first. Use to manually pin a project to the top of its category.",
      initialValue: 100,
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "meta",
      description: "Used for sorting if displayOrder ties.",
      initialValue: () => new Date().toISOString(),
    }),
  ],

  orderings: [
    {
      title: "Manual order, then newest",
      name: "manualThenNewest",
      by: [
        { field: "displayOrder", direction: "asc" },
        { field: "publishedAt", direction: "desc" },
      ],
    },
    {
      title: "Newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "category.title",
      media: "leadImage",
      year: "year",
      featured: "featured",
    },
    prepare({ title, subtitle, media, year, featured }) {
      return {
        title: `${title}${featured ? " ⭐" : ""}`,
        subtitle: [year, subtitle].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
