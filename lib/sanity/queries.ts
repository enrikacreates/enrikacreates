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

/* ---------- Category ---------- */

const CATEGORY_FIELDS = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  "listed": listed == true,
  order,
  blurb,
  color
`;

/**
 * Every category, listed or not. Drives /all, the sitemap's exclusion logic,
 * and generateStaticParams for the /[category] route.
 */
export const ALL_CATEGORIES_QUERY = /* groq */ `
  *[_type == "category" && defined(slug.current)]
    | order(order asc, title asc) {
    ${CATEGORY_FIELDS}
  }
`;

/** Only the public ones — the filter bar and sitemap use this. */
export const LISTED_CATEGORIES_QUERY = /* groq */ `
  *[_type == "category" && defined(slug.current) && listed == true]
    | order(order asc, title asc) {
    ${CATEGORY_FIELDS}
  }
`;

/** One category by slug — for the /[category] page header + metadata. */
export const CATEGORY_BY_SLUG_QUERY = /* groq */ `
  *[_type == "category" && slug.current == $slug][0] {
    ${CATEGORY_FIELDS}
  }
`;

/* ---------- Project ---------- */

const PROJECT_FIELDS = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  category->{ title, "slug": slug.current, "listed": listed == true },
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

/** Every project, regardless of category visibility. Powers /all. */
export const ALL_PROJECTS_QUERY = /* groq */ `
  *[_type == "project"] | order(displayOrder asc, publishedAt desc) {
    ${PROJECT_FIELDS}
  }
`;

/**
 * Projects whose category is public. This is what the home catalog and /work
 * show, so hiding a category genuinely removes its work from the public read
 * rather than just removing the nav pill.
 */
export const LISTED_PROJECTS_QUERY = /* groq */ `
  *[_type == "project" && category->listed == true]
    | order(displayOrder asc, publishedAt desc) {
    ${PROJECT_FIELDS}
  }
`;

/** Projects in one category, looked up by the category's slug. */
export const PROJECTS_BY_CATEGORY_QUERY = /* groq */ `
  *[_type == "project" && category->slug.current == $category]
    | order(displayOrder asc, publishedAt desc) {
    ${PROJECT_FIELDS}
  }
`;

/**
 * Featured projects — the top row above the catalog. Constrained to public
 * categories: the featured row appears on public pages, so a starred project
 * in a hidden category must not leak through it.
 */
export const FEATURED_PROJECTS_QUERY = /* groq */ `
  *[_type == "project" && featured == true && category->listed == true]
    | order(displayOrder asc, publishedAt desc)[0..2] {
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
  category->{ title, "slug": slug.current, "listed": listed == true },
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
