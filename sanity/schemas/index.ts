/**
 * Schema registry.
 *
 * MIGRATION TEMPLATE NOTE:
 *   Add new object/document types here. Order doesn't matter for Sanity,
 *   but grouping objects-first / documents-second keeps this readable.
 */

import type { SchemaTypeDefinition } from "sanity";

// Reusable object types (embedded in documents)
import { brandColorOptions } from "./objects/brandColor"; // exports only — not a schema
import { slide } from "./objects/slide";
import { galleryItem } from "./objects/galleryItem";
import { pullQuote } from "./objects/pullQuote";

// Document types (top-level)
import { project } from "./documents/project";
import { blogPost } from "./documents/blogPost";
import { siteSettings } from "./documents/siteSettings";
import { subscriber } from "./documents/subscriber";

export const schemaTypes: SchemaTypeDefinition[] = [
  // objects first
  slide,
  galleryItem,
  pullQuote,
  // then documents
  project,
  blogPost,
  siteSettings,
  subscriber,
];

// Re-export the color palette so the frontend can use it too.
export { brandColorOptions };
