/**
 * Slide — a single image in the project Designs slideshow.
 *
 * MIGRATION TEMPLATE NOTE:
 *   Embedded inside `project.slides` (array of slides). NOT a top-level
 *   document — slides are not reusable across projects.
 *
 *   Hotspot enabled so you can pick the focal point per image.
 */

import { defineType, defineField } from "sanity";

export const slide = defineType({
  name: "slide",
  title: "Slide",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description: "Describe what's in the image for accessibility.",
      validation: (Rule) =>
        Rule.required()
          .min(3)
          .warning("Alt text is required for accessibility."),
    }),
  ],
  preview: {
    select: {
      media: "image",
      title: "alt",
    },
    prepare({ media, title }) {
      return {
        title: title || "Untitled slide",
        media,
      };
    },
  },
});
