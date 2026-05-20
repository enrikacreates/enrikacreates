/**
 * Embedded Sanity Studio route.
 *
 * The catch-all segment `[[...tool]]` lets the Studio handle its own internal
 * routing (vision tool, structure tool, etc.) under /studio/*.
 *
 * MIGRATION TEMPLATE NOTE:
 *   This file is identical for every project. Don't customize it.
 *   Studio configuration lives in /sanity.config.ts.
 *
 *   Must be a Client Component — Sanity Studio uses React Context which
 *   cannot run in a Server Component. Metadata lives in the sibling layout.
 */

"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
