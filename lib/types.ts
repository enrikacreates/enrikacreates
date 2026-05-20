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

export type ProjectCategory =
  | "fashion"
  | "product"
  | "apps"
  | "web"
  | "event"
  | "writing";

export type BlogCategory = "fashion" | "product" | "community" | "hope";

/* ---------- Project ---------- */

export interface ProjectSlide {
  alt: string;
  image: SanityImage;
}

export interface GalleryItem {
  caption: string;
  image: SanityImage;
}

/** Light shape — used in grids/cards where we don't need story content. */
export interface ProjectListItem {
  _id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  color: string;
  year: string;
  tagline: string;
  featured?: boolean;
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
  slides?: ProjectSlide[];
  gallery?: GalleryItem[];
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
