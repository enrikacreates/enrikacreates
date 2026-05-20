/**
 * GROQ queries — single source of truth for what the frontend asks Sanity for.
 *
 * MIGRATION TEMPLATE NOTE:
 *   Group queries by document type. Always project (`{ ... }`) the exact
 *   fields you need — this controls payload size and gives clean types.
 *   Image asset references are projected with `..., asset->{_id, url, metadata}`
 *   so the image URL builder has everything it needs.
 *
 *   `defineQuery` from groq helps with type inference once typegen runs.
 *   Pre-typegen we use plain string templates; Phase 5 swaps to defineQuery.
 */

/* ---------- Project ---------- */

const PROJECT_FIELDS = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  category,
  color,
  year,
  tagline,
  featured,
  displayOrder,
  publishedAt,
  leadImage{
    ..., asset->{_id, url, metadata}, hotspot, crop
  }
`;

const PROJECT_FULL_FIELDS = /* groq */ `
  ${PROJECT_FIELDS},
  oneline,
  challenge,
  action,
  result,
  galleryIntro,
  skills,
  slides[]{
    alt,
    image{..., asset->{_id, url, metadata}, hotspot, crop}
  },
  gallery[]{
    caption,
    image{..., asset->{_id, url, metadata}, hotspot, crop}
  }
`;

/** All projects — for the catalog grid. */
export const ALL_PROJECTS_QUERY = /* groq */ `
  *[_type == "project"] | order(displayOrder asc, publishedAt desc) {
    ${PROJECT_FIELDS}
  }
`;

/** Projects filtered by category. */
export const PROJECTS_BY_CATEGORY_QUERY = /* groq */ `
  *[_type == "project" && category == $category] | order(displayOrder asc, publishedAt desc) {
    ${PROJECT_FIELDS}
  }
`;

/** Featured projects — for the top row above the catalog. */
export const FEATURED_PROJECTS_QUERY = /* groq */ `
  *[_type == "project" && featured == true] | order(displayOrder asc, publishedAt desc)[0..2] {
    ${PROJECT_FIELDS}
  }
`;

/** Single project by slug — for /work/[slug]. */
export const PROJECT_BY_SLUG_QUERY = /* groq */ `
  *[_type == "project" && slug.current == $slug][0] {
    ${PROJECT_FULL_FIELDS}
  }
`;

/** Slugs for static path generation (generateStaticParams). */
export const PROJECT_SLUGS_QUERY = /* groq */ `
  *[_type == "project" && defined(slug.current)][].slug.current
`;

/* ---------- Blog post ---------- */

const POST_LIST_FIELDS = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  category,
  color,
  tagline,
  excerpt,
  publishedAt,
  featured,
  leadImage{..., asset->{_id, url, metadata}, hotspot, crop}
`;

export const ALL_POSTS_QUERY = /* groq */ `
  *[_type == "blogPost"] | order(publishedAt desc) {
    ${POST_LIST_FIELDS}
  }
`;

export const POST_BY_SLUG_QUERY = /* groq */ `
  *[_type == "blogPost" && slug.current == $slug][0] {
    ${POST_LIST_FIELDS},
    body[]{
      ...,
      _type == "image" => {
        ..., asset->{_id, url, metadata}, hotspot, crop
      },
      markDefs[]{...}
    },
    seoDescription,
    relatedPosts[]->{ ${POST_LIST_FIELDS} }
  }
`;

export const POST_SLUGS_QUERY = /* groq */ `
  *[_type == "blogPost" && defined(slug.current)][].slug.current
`;

/* ---------- Site settings (singleton) ---------- */

export const SITE_SETTINGS_QUERY = /* groq */ `
  *[_type == "siteSettings"][0] {
    siteName,
    tagline,
    heroStatement,
    newsletterTitle,
    newsletterSub,
    newsletterThreads,
    socialLinks,
    contactEmail,
    footerCopy
  }
`;
