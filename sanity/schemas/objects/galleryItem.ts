/**
 * Gallery item — a single image in the Process gallery with a caption.
 *
 * MIGRATION TEMPLATE NOTE:
 *   Embedded inside `project.gallery` (array of items).
 *   Caption is required because the rendered grid uses uniform-height
 *   caption strips (see `.gallery-caption` in the frontend).
 */

import { defineType, defineField } from "sanity";

export const galleryItem = defineType({
  name: "galleryItem",
  title: "Gallery item",
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
      name: "caption",
      title: "Caption",
      type: "string",
      description:
        "Short editorial caption (e.g. 'Miniature silhouette test: V-neck buildup'). Appears below the image.",
      validation: (Rule) => Rule.required().max(120),
    }),
  ],
  preview: {
    select: {
      media: "image",
      title: "caption",
    },
  },
});
