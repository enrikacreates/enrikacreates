/**
 * Process step — one beat in the research-and-design story on a project page.
 *
 * The shape is deliberately three questions rather than one free "notes" box:
 * what you looked at, what it told you, and what changed because of it. A
 * portfolio that only shows the finished screens reads as decoration; the
 * "what changed" line is the one that shows judgement, so it is the point of
 * the whole type. Steps with no `changed` still render, but they're the weak
 * ones and the Studio description says so.
 *
 * `kind` drives a small label on the rendered step, so a reader scanning the
 * page can see the shape of the process without reading every word.
 *
 * Embedded in `project.process`.
 */

import { defineType, defineField } from "sanity";

/** Reads as a sequence when steps are listed in order. */
export const PROCESS_KINDS = [
  { title: "Research", value: "research" },
  { title: "Insight", value: "insight" },
  { title: "Decision", value: "decision" },
  { title: "Iteration", value: "iteration" },
  { title: "Validation", value: "validation" },
] as const;

export const processStep = defineType({
  name: "processStep",
  title: "Process step",
  type: "object",
  fields: [
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      description: "The label shown above the step.",
      options: { list: [...PROCESS_KINDS], layout: "radio", direction: "horizontal" },
      initialValue: "research",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Step title",
      type: "string",
      description:
        "A specific claim, not a stage name. 'Songwriters lose ideas in voice memos' beats 'User research'.",
      validation: (Rule) => Rule.required().max(90),
    }),
    defineField({
      name: "researched",
      title: "What I did",
      type: "text",
      rows: 3,
      description:
        "The actual activity: who you spoke to, what you tested, what you measured or read.",
    }),
    defineField({
      name: "learned",
      title: "What it told me",
      type: "text",
      rows: 3,
      description: "The finding. Concrete beats tidy.",
    }),
    defineField({
      name: "changed",
      title: "What changed because of it",
      type: "text",
      rows: 3,
      description:
        "The design or build decision that followed. This is the line that shows judgement, so a step without it is doing much less work.",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      description:
        "Optional. A screen, a sketch, a whiteboard. Screenshots captured by `npm run shots` live in public/assets/projects/<slug>/shots/ and can be uploaded here.",
    }),
    defineField({
      name: "caption",
      title: "Image caption",
      type: "string",
      description: "Only used when there's an image.",
      validation: (Rule) => Rule.max(140),
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description:
        "What the image shows, for screen readers. Describe the content, not the fact that it's a screenshot.",
      validation: (Rule) => Rule.max(140),
    }),
  ],

  preview: {
    select: { title: "title", kind: "kind", media: "image", changed: "changed" },
    prepare({ title, kind, media, changed }) {
      const label = PROCESS_KINDS.find((k) => k.value === kind)?.title ?? kind;
      return {
        title,
        subtitle: changed ? label : `${label} · no outcome yet`,
        media,
      };
    },
  },
});
