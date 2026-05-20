/**
 * Blog post — long-form content under /blog and /blog/[slug].
 *
 * MIGRATION TEMPLATE NOTE:
 *   Same hero treatment as Project (color + leadImage), so the
 *   card-as-hero component is reused across both types in Phase 3.
 *
 *   Body uses Portable Text — Sanity's structured rich-text format.
 *   Embedded `image` and `pullQuote` blocks let you compose visually
 *   without leaving the editor.
 */

import { defineType, defineField } from "sanity";
import { brandColorOptions } from "../objects/brandColor";

export const blogPost = defineType({
  name: "blogPost",
  title: "Blog post",
  type: "document",

  groups: [
    { name: "header", title: "Header", default: true },
    { name: "body", title: "Body" },
    { name: "meta", title: "Meta & SEO" },
  ],

  fields: [
    /* ---------- Header ---------- */
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "header",
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "header",
      description: "URL path: /blog/[slug]",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Newsletter thread",
      type: "string",
      group: "header",
      description: "Which of the four threads this post belongs to.",
      options: {
        list: [
          { title: "Fashion", value: "fashion" },
          { title: "Product", value: "product" },
          { title: "Community Building", value: "community" },
          { title: "Everyday Hope Stories", value: "hope" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "color",
      title: "Header color",
      type: "string",
      group: "header",
      description: "Brand color for the card + detail page hero.",
      options: { list: brandColorOptions, layout: "radio", direction: "horizontal" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "leadImage",
      title: "Lead image",
      type: "image",
      group: "header",
      description: "Hero image — appears in the card and as the detail header.",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "header",
      description: "One-line summary shown on the card.",
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "header",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),

    /* ---------- Body ---------- */
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      group: "body",
      rows: 3,
      description:
        "Short summary shown in feeds and as the meta description. ~140–200 chars.",
      validation: (Rule) => Rule.max(220),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      group: "body",
      description: "Long-form content. Mix paragraphs, images, and pull quotes.",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (Rule) =>
                      Rule.uri({ scheme: ["http", "https", "mailto"] }),
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alt text",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "caption",
              type: "string",
              title: "Caption",
            },
          ],
        },
        { type: "pullQuote" },
      ],
    }),

    /* ---------- Meta ---------- */
    defineField({
      name: "featured",
      title: "Featured on blog index",
      type: "boolean",
      group: "meta",
      initialValue: false,
    }),
    defineField({
      name: "relatedPosts",
      title: "Related posts",
      type: "array",
      group: "meta",
      of: [{ type: "reference", to: [{ type: "blogPost" }] }],
      description: "Manually pick posts to show in the 'related' section.",
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description (override)",
      type: "string",
      group: "meta",
      description:
        "Optional — overrides the excerpt for meta description. Leave blank to use excerpt.",
      validation: (Rule) => Rule.max(160),
    }),
  ],

  orderings: [
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
      date: "publishedAt",
      featured: "featured",
    },
    prepare({ title, subtitle, media, date, featured }) {
      const dateStr = date ? new Date(date).toLocaleDateString() : "Draft";
      return {
        title: `${title}${featured ? " ⭐" : ""}`,
        subtitle: [dateStr, subtitle].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
