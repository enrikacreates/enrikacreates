/**
 * Brand color palette — single source of truth for approved colors.
 *
 * MIGRATION TEMPLATE NOTE:
 *   When porting to a new project, edit just the COLORS array below.
 *   Every schema that uses brand color (project, blogPost) imports from here,
 *   so palette changes propagate automatically.
 *
 *   The shape is { title, value, css? } — `css` lets future schemas reference
 *   a CSS variable name if you'd rather not hard-code hex in the frontend.
 */

export const BRAND_COLORS = [
  { title: "Coral", value: "#FC7F5A", css: "--color-coral" },
  { title: "Blue", value: "#3498CE", css: "--color-blue" },
  { title: "Pink", value: "#F7B5B1", css: "--color-pink" },
  { title: "Gold", value: "#E8B84A", css: "--color-gold" },
  { title: "Sage", value: "#7FA481", css: "--color-sage" },
  { title: "Cream", value: "#FBF7EF", css: "--color-cream" },
  { title: "Ink", value: "#2C2520", css: "--color-ink" },
] as const;

export type BrandColorValue = (typeof BRAND_COLORS)[number]["value"];

/**
 * The shape passed to Sanity's `options.list` for a string field.
 * Used by both `project.ts` and `blogPost.ts` color fields.
 */
export const brandColorOptions = BRAND_COLORS.map(({ title, value }) => ({
  title,
  value,
}));
