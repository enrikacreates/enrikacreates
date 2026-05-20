/**
 * Sanity Studio config — defines what the embedded admin at /studio looks like.
 *
 * MIGRATION TEMPLATE NOTE:
 *   - `name` and `title` are display-only — change per project.
 *   - `projectId` and `dataset` come from env, so copying this file
 *     to a new project requires zero edits beyond the values above.
 *   - Add custom structure (sidebar layout, grouped collections) via
 *     `structureTool({ structure })` once Phase 2 schemas land.
 */

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { schemaTypes } from "./sanity/schemas";
import { apiVersion, dataset, projectId } from "./lib/sanity/env";

export default defineConfig({
  name: "enrikacreates",
  title: "Enrika Creates",
  projectId,
  dataset,

  // Studio lives at /studio in the Next.js app
  basePath: "/studio",

  plugins: [
    structureTool(),
    visionTool({ defaultApiVersion: apiVersion }),
  ],

  schema: {
    types: schemaTypes,
  },
});
