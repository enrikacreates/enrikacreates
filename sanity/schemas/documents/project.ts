/**
 * Project — a portfolio entry (the "work" cards on /, /fashion, /web, etc.
 * and the detail page at /work/[slug]).
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
      type: "string",
      group: "details",
      options: {
        list: [
          { title: "Fashion", value: "fashion" },
          { title: "Product", value: "product" },
          { title: "Apps", value: "apps" },
          { title: "Web", value: "web" },
          { title: "Event", value: "event" },
          { title: "Writing", value: "writing" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
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

    /* ---------- Media ---------- */
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
      subtitle: "category",
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
