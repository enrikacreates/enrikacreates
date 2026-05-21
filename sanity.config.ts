/**
 * Sanity Studio config — defines what the embedded admin at /studio looks like.
 *
 * MIGRATION TEMPLATE NOTE:
 *   - `name` and `title` are display-only — change per project.
 *   - `projectId` and `dataset` come from env, so copying this file
 *     to a new project requires zero edits beyond the env vars.
 *   - The custom structure below organizes the sidebar by content type
 *     and enforces a singleton for `siteSettings` (one document only).
 */

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { schemaTypes } from "./sanity/schemas";
import { apiVersion, dataset, projectId } from "./lib/sanity/env";

/**
 * Sidebar structure — organizes docs by type, makes siteSettings a singleton.
 *
 * Without this customization, every doc type appears as a flat list and editors
 * can accidentally create multiple "Site settings" docs. This builder explicitly
 * lists what shows up and how.
 */
const customStructure = (S: any) =>
  S.list()
    .title("Content")
    .items([
      // Portfolio projects — sorted by manual order, then newest
      S.documentTypeListItem("project").title("Projects"),

      // Blog posts
      S.documentTypeListItem("blogPost").title("Blog posts"),

      // Newsletter subscribers (read-only, captured from the form)
      S.documentTypeListItem("subscriber").title("Subscribers"),

      S.divider(),

      // Site settings — singleton (one doc, no list view)
      S.listItem()
        .title("Site settings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
        ),
    ]);

export default defineConfig({
  name: "enrikacreates",
  title: "Enrika Creates",
  projectId,
  dataset,

  // Studio lives at /studio in the Next.js app
  basePath: "/studio",

  plugins: [
    structureTool({ structure: customStructure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],

  schema: {
    types: schemaTypes,

    /**
     * Hide `siteSettings` (singleton) and `subscriber` (form-only) from the
     * global "Create new" menu.
     */
    templates: (prev) =>
      prev.filter((t) => !["siteSettings", "subscriber"].includes(t.schemaType)),
  },

  document: {
    /**
     * Hide the "Duplicate" and "Delete" actions for the siteSettings doc.
     */
    actions: (prev, { schemaType }) =>
      schemaType === "siteSettings"
        ? prev.filter(({ action }) => !["duplicate", "delete"].includes(action ?? ""))
        : prev,
  },
});
