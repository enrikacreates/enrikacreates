/**
 * Pull quote — embeddable callout for blog post body content.
 *
 * MIGRATION TEMPLATE NOTE:
 *   Registered inside the Portable Text array of `blogPost.body`.
 *   Renders as a styled `<blockquote>` (Phase 3 wires the visual).
 *   Useful for breaking up long-form copy with editorial emphasis.
 */

import { defineType, defineField } from "sanity";

export const pullQuote = defineType({
  name: "pullQuote",
  title: "Pull quote",
  type: "object",
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required().max(300),
    }),
    defineField({
      name: "attribution",
      title: "Attribution",
      type: "string",
      description: "Optional — who said it (e.g. 'Massimo Vignelli').",
    }),
  ],
  preview: {
    select: {
      title: "quote",
      subtitle: "attribution",
    },
    prepare({ title, subtitle }) {
      return {
        title: title ? `"${title.slice(0, 60)}${title.length > 60 ? "…" : ""}"` : "Empty quote",
        subtitle: subtitle ? `— ${subtitle}` : undefined,
      };
    },
  },
});
