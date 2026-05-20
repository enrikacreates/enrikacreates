/**
 * Site settings — singleton (one document only).
 *
 * MIGRATION TEMPLATE NOTE:
 *   Holds the things that change rarely but should not be hard-coded:
 *   tagline, newsletter copy, social links, footer text.
 *
 *   The Studio structure (sanity.config.ts) enforces singleton behavior
 *   so editors see one "Site settings" item instead of a list.
 */

import { defineType, defineField } from "sanity";
import { brandColorOptions } from "../objects/brandColor";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",

  // Singleton — editors shouldn't see a "create new" button.
  // The desk structure in sanity.config.ts handles this.

  fields: [
    defineField({
      name: "siteName",
      title: "Site name",
      type: "string",
      validation: (Rule) => Rule.required(),
      initialValue: "Enrika Creates",
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "Shown under the logo on the home hero.",
      initialValue: "Designer. Builder. Storyteller.",
    }),
    defineField({
      name: "heroStatement",
      title: "Hero statement",
      type: "text",
      rows: 2,
      description: "Hero copy under the tagline.",
      initialValue:
        "I design storytelling experiences that inspire hope and ignite purpose.",
    }),

    /* ---------- Newsletter ---------- */
    defineField({
      name: "newsletterTitle",
      title: "Newsletter title",
      type: "string",
      group: "newsletter",
      initialValue: "Enrika Creates",
    }),
    defineField({
      name: "newsletterSub",
      title: "Newsletter subtitle",
      type: "string",
      initialValue: "One letter. Four threads woven together.",
    }),
    defineField({
      name: "newsletterThreads",
      title: "Newsletter threads",
      type: "array",
      description:
        "The threads shown in the newsletter modal (Fashion, Product, etc.).",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "name",
              type: "string",
              title: "Thread name",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "color",
              type: "string",
              title: "Color dot",
              options: { list: brandColorOptions },
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: { title: "name", subtitle: "color" },
          },
        },
      ],
      initialValue: [
        { name: "Fashion", color: "#FC7F5A" },
        { name: "Product", color: "#3498CE" },
        { name: "Community Building", color: "#F7B5B1" },
        { name: "Everyday Hope Stories", color: "#E8B84A" },
      ],
    }),

    /* ---------- Social ---------- */
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "platform",
              type: "string",
              title: "Platform",
              options: {
                list: [
                  { title: "Instagram", value: "instagram" },
                  { title: "Pinterest", value: "pinterest" },
                  { title: "LinkedIn", value: "linkedin" },
                  { title: "Email", value: "email" },
                  { title: "Other", value: "other" },
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: "url",
              type: "url",
              title: "URL",
              validation: (Rule) =>
                Rule.uri({ scheme: ["http", "https", "mailto"] }).required(),
            },
            {
              name: "label",
              type: "string",
              title: "Label (optional override)",
              description:
                "Defaults to platform name. Override for 'Email' = 'enrika@...' etc.",
            },
          ],
          preview: { select: { title: "platform", subtitle: "url" } },
        },
      ],
    }),
    defineField({
      name: "contactEmail",
      title: "Contact email",
      type: "string",
      description: "Used by the floating email button + 'mailto:' links.",
      validation: (Rule) => Rule.required().email(),
      initialValue: "enrika@smallgorillamarketing.com",
    }),
    defineField({
      name: "footerCopy",
      title: "Footer copyright",
      type: "string",
      description: "Year is auto-appended if you use {year} placeholder.",
      initialValue: "© {year} Enrika Greathouse",
    }),
  ],

  preview: {
    prepare() {
      return { title: "Site settings" };
    },
  },
});
