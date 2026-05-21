/**
 * Subscriber — a newsletter signup captured from the site form.
 *
 * MIGRATION TEMPLATE NOTE:
 *   Written server-side via /api/subscribe (never from the client — that
 *   would expose the write token). Read-only in the Studio so you can see /
 *   export the list, but not hand-edit emails. Deterministic _id (from the
 *   email) makes signups idempotent — re-subscribing won't create duplicates.
 */

import { defineType, defineField } from "sanity";

export const subscriber = defineType({
  name: "subscriber",
  title: "Subscriber",
  type: "document",
  // Read-only in Studio — these come from the form, not manual entry.
  readOnly: true,
  fields: [
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "subscribedAt",
      title: "Subscribed at",
      type: "datetime",
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      description: "Where the signup came from (e.g. newsletter modal).",
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "subscribedAtDesc",
      by: [{ field: "subscribedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "email", subtitle: "subscribedAt" },
    prepare({ title, subtitle }) {
      return {
        title: title || "(no email)",
        subtitle: subtitle ? new Date(subtitle).toLocaleString() : "",
      };
    },
  },
});
