/**
 * Server-side Sanity fetch helpers — typed wrappers around the client.
 *
 * MIGRATION TEMPLATE NOTE:
 *   These wrap `client.fetch` to add Next.js caching tags + types in one place.
 *   Components should import from this file, not call `client.fetch` directly,
 *   so we can swap caching strategy globally later (e.g., add revalidate
 *   webhook integration in Phase 5).
 */

import { client } from "./client";
import {
  ALL_PROJECTS_QUERY,
  PROJECTS_BY_CATEGORY_QUERY,
  FEATURED_PROJECTS_QUERY,
  PROJECT_BY_SLUG_QUERY,
  PROJECT_SLUGS_QUERY,
  ALL_POSTS_QUERY,
  POST_BY_SLUG_QUERY,
  POST_SLUGS_QUERY,
  SITE_SETTINGS_QUERY,
} from "./queries";
import type {
  Project,
  ProjectListItem,
  ProjectCategory,
  BlogPost,
  BlogPostListItem,
  SiteSettings,
} from "../types";

/** Default Next.js cache + revalidate hint. Webhook will bust on Sanity update later. */
const DEFAULT_NEXT_OPTS = {
  next: { revalidate: 60, tags: ["sanity"] as string[] },
};

/* ---------- Projects ---------- */

export async function getAllProjects(): Promise<ProjectListItem[]> {
  return client.fetch(ALL_PROJECTS_QUERY, {}, DEFAULT_NEXT_OPTS);
}

export async function getProjectsByCategory(
  category: ProjectCategory
): Promise<ProjectListItem[]> {
  return client.fetch(PROJECTS_BY_CATEGORY_QUERY, { category }, DEFAULT_NEXT_OPTS);
}

export async function getFeaturedProjects(): Promise<ProjectListItem[]> {
  return client.fetch(FEATURED_PROJECTS_QUERY, {}, DEFAULT_NEXT_OPTS);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return client.fetch(PROJECT_BY_SLUG_QUERY, { slug }, DEFAULT_NEXT_OPTS);
}

export async function getAllProjectSlugs(): Promise<string[]> {
  return client.fetch(PROJECT_SLUGS_QUERY, {}, DEFAULT_NEXT_OPTS);
}

/* ---------- Blog ---------- */

export async function getAllPosts(): Promise<BlogPostListItem[]> {
  return client.fetch(ALL_POSTS_QUERY, {}, DEFAULT_NEXT_OPTS);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return client.fetch(POST_BY_SLUG_QUERY, { slug }, DEFAULT_NEXT_OPTS);
}

export async function getAllPostSlugs(): Promise<string[]> {
  return client.fetch(POST_SLUGS_QUERY, {}, DEFAULT_NEXT_OPTS);
}

/* ---------- Site settings ---------- */

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return client.fetch(SITE_SETTINGS_QUERY, {}, DEFAULT_NEXT_OPTS);
}
