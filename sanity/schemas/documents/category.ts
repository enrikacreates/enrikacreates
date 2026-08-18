/**
 * Category — a portfolio section, editable from the Studio.
 *
 * Categories used to be a hard-coded string list on `project.category` plus a
 * matching label map in the frontend. They're now documents so that adding,
 * renaming, reordering, or hiding a section is a content change, not a deploy.
 *
 * Two ideas do the work here:
 *
 *   `slug`   — the public route. Every category is reachable at /[slug]
 *              (e.g. /mobile, /fashion) whether or not it's listed.
 *   `listed` — whether it shows up in the filter bar, the sitemap, and search
 *              engines. Unlisted categories stay live and shareable by link but
 *              stay out of the way of anyone reading the site as a hiring
 *              portfolio. See app/(site)/[category]/page.tsx.
 *
 * MIGRATION TEMPLATE NOTE:
 *   `RESERVED_SLUGS` guards the slugs that already belong to real routes, so a
 *   category can't quietly shadow /work, /blog, or the /all overview.
 */

import { defineType, defineField } from "sanity";
import { brandColorOptions } from "../objects/brandColor";

/** Route segments a category slug must not claim. */
export const RESERVED_SLUGS = [
  "all",
  "work",
  "blog",
  "studio",
  "api",
  "assets",
];

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Shown on the filter bar and as the category page heading.",
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "The public route. 'mobile' becomes /mobile.",
      options: { source: "title", maxLength: 40 },
      validation: (Rule) =>
        Rule.required().custom((value) => {
          const current = value?.current;
          if (!current) return "A slug is required.";
          if (RESERVED_SLUGS.includes(current)) {
            return `'${current}' is a reserved route. Pick a different slug.`;
          }
          return true;
        }),
    }),
    defineField({
      name: "listed",
      title: "Show publicly",
      type: "boolean",
      description:
        "On: appears in the filter bar and sitemap, and search engines may index it. " +
        "Off: still live at its own URL and still included in /all, but hidden from " +
        "navigation and marked noindex. Use this to keep the public read focused.",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Lower numbers come first in the filter bar.",
      initialValue: 100,
      validation: (Rule) => Rule.integer(),
    }),
    defineField({
      name: "blurb",
      title: "Intro line",
      type: "text",
      rows: 3,
      description:
        "Optional sentence under the heading on the category page, e.g. 'Native apps designed and shipped end to end.'",
      validation: (Rule) => Rule.max(240),
    }),
    defineField({
      name: "color",
      title: "Accent color",
      type: "string",
      description: "Used for the category page heading accent.",
      options: { list: brandColorOptions, layout: "radio", direction: "horizontal" },
    }),
  ],

  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [
        { field: "order", direction: "asc" },
        { field: "title", direction: "asc" },
      ],
    },
  ],

  preview: {
    select: { title: "title", slug: "slug.current", listed: "listed", order: "order" },
    prepare({ title, slug, listed, order }) {
      return {
        title: `${title}${listed ? "" : "  ·  hidden"}`,
        subtitle: `/${slug ?? "…"}${typeof order === "number" ? `  ·  order ${order}` : ""}`,
      };
    },
  },
});
