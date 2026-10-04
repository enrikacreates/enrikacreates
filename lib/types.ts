/**
 * TypeScript interfaces matching the Sanity schemas.
 *
 * MIGRATION TEMPLATE NOTE:
 *   Phase 5 will replace this hand-written file with auto-generated types
 *   from `npm run typegen` (which reads sanity.config + queries to emit
 *   the canonical types). For now, hand-written keeps the dev loop simple.
 *
 *   When adding a field to a schema in /sanity/schemas, mirror it here.
 */

import type { PortableTextBlock } from "next-sanity";

/* ---------- Shared ---------- */

export interface SanityImage {
  asset?: {
    _id: string;
    url: string;
    metadata?: {
      dimensions?: { width: number; height: number; aspectRatio: number };
      lqip?: string;
    };
  };
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  alt?: string;
}

export type BlogCategory = "fashion" | "product" | "community" | "hope";

/* ---------- Category ---------- */

/**
 * A portfolio section. `listed` decides whether it shows in the filter bar,
 * the sitemap, and to search engines; unlisted categories stay live at their
 * own URL and stay included in /all.
 */
export interface Category {
  _id: string;
  title: string;
  slug: string;
  listed: boolean;
  order?: number;
  blurb?: string;
  color?: string;
}

/** The dereferenced shape carried on every project. */
export interface CategoryRef {
  title: string;
  slug: string;
  listed: boolean;
}

/* ---------- Project ---------- */

export interface ProjectSlide {
  alt: string;
  image: SanityImage;
}

export interface GalleryItem {
  caption: string;
  image: SanityImage;
}

/** One beat of the research-and-design story. See schemas/objects/processStep. */
export type ProcessKind =
  | "research"
  | "insight"
  | "decision"
  | "iteration"
  | "validation";

export interface ProcessStep {
  kind: ProcessKind;
  title: string;
  /** All three are optional; a step with only a title still renders. */
  researched?: string;
  learned?: string;
  changed?: string;
  image?: SanityImage;
  caption?: string;
  alt?: string;
}

/** Light shape — used in grids/cards where we don't need story content. */
export interface ProjectListItem {
  _id: string;
  title: string;
  slug: string;
  category: CategoryRef;
  color: string;
  year: string;
  tagline: string;
  featured?: boolean;
  /** Short "what is this" markers shown under a card. See project.signals. */
  signals?: string[];
  displayOrder?: number;
  publishedAt?: string;
  leadImage?: SanityImage;
}

/** Full shape — used on the detail page. */
export interface Project extends ProjectListItem {
  oneline?: string;
  challenge?: string;
  action?: string;
  result?: string;
  galleryIntro?: string;
  skills?: string[];
  /** Which band of the poster the case page's banner crops to. */
  bannerAlign?: "top" | "center" | "bottom";
  /** Exact band, 0-100. Overrides bannerAlign when set. */
  bannerFocus?: number;
  /** Where the case-study chip points. Falls back to a local deck. */
  caseUrl?: string;
  keyScreens?: GalleryItem[];
  slides?: ProjectSlide[];
  gallery?: GalleryItem[];
  process?: ProcessStep[];
}

/* ---------- Blog ---------- */

export interface BlogPostListItem {
  _id: string;
  title: string;
  slug: string;
  category: BlogCategory;
  color: string;
  tagline: string;
  excerpt?: string;
  publishedAt: string;
  featured?: boolean;
  leadImage?: SanityImage;
}

export interface BlogPost extends BlogPostListItem {
  body?: PortableTextBlock[];
  seoDescription?: string;
  relatedPosts?: BlogPostListItem[];
}

/* ---------- Site settings ---------- */

export interface NewsletterThread {
  name: string;
  color: string;
}

export interface SocialLink {
  platform: "instagram" | "pinterest" | "linkedin" | "email" | "other";
  url: string;
  label?: string;
}

export interface SiteSettings {
  siteName: string;
  tagline?: string;
  heroStatement?: string;
  newsletterTitle?: string;
  newsletterSub?: string;
  newsletterThreads?: NewsletterThread[];
  socialLinks?: SocialLink[];
  contactEmail: string;
  footerCopy?: string;
}
