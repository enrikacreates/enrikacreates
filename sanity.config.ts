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
 *
 * Projects are reachable three ways, because each answers a different question:
 *   All projects        — "where is that one thing I wrote last week?"
 *   By category         — "what's actually in /mobile right now?"
 *   Needs a story       — "what's still a stub with no case study written?"
 *
 * "By category" drills through the category documents themselves, so a category
 * added in the Studio shows up here immediately with no code change.
 */
const customStructure = (S: any) =>
  S.list()
    .title("Content")
    .items([
      // Portfolio projects
      S.listItem()
        .title("Projects")
        .child(
          S.list()
            .title("Projects")
            .items([
              S.listItem()
                .title("All projects")
                .child(
                  S.documentTypeList("project")
                    .title("All projects")
                    .defaultOrdering([
                      { field: "displayOrder", direction: "asc" },
                      { field: "publishedAt", direction: "desc" },
                    ])
                ),

              S.listItem()
                .title("By category")
                .child(
                  S.documentTypeList("category")
                    .title("By category")
                    .defaultOrdering([
                      { field: "order", direction: "asc" },
                      { field: "title", direction: "asc" },
                    ])
                    .child((categoryId: string) =>
                      S.documentList()
                        .title("Projects")
                        .schemaType("project")
                        .filter('_type == "project" && category._ref == $categoryId')
                        .params({ categoryId })
                        .defaultOrdering([
                          { field: "displayOrder", direction: "asc" },
                          { field: "publishedAt", direction: "desc" },
                        ])
                        // New docs created from here inherit the category.
                        .initialValueTemplates([
                          S.initialValueTemplateItem("project-by-category", {
                            categoryId,
                          }),
                        ])
                    )
                ),

              S.listItem()
                .title("Featured")
                .child(
                  S.documentList()
                    .title("Featured")
                    .schemaType("project")
                    .filter('_type == "project" && featured == true')
                    .defaultOrdering([{ field: "displayOrder", direction: "asc" }])
                ),

              S.listItem()
                .title("Needs a story")
                .child(
                  S.documentList()
                    .title("Needs a story")
                    .schemaType("project")
                    .filter(
                      '_type == "project" && (!defined(challenge) || !defined(action) || !defined(result))'
                    )
                    .defaultOrdering([{ field: "displayOrder", direction: "asc" }])
                ),
            ])
        ),

      // Categories — the sections themselves, and what's public
      S.documentTypeListItem("category").title("Categories"),

      S.divider(),

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
     * global "Create new" menu, and add the template that lets "Projects >
     * By category > <a category>" create a project already filed under that
     * category (referenced by the structure builder above).
     */
    templates: (prev) => [
      ...prev.filter(
        (t) => !["siteSettings", "subscriber"].includes(t.schemaType)
      ),
      {
        id: "project-by-category",
        title: "Project in this category",
        schemaType: "project",
        parameters: [{ name: "categoryId", type: "string" }],
        value: ({ categoryId }: { categoryId: string }) => ({
          category: { _type: "reference", _ref: categoryId },
        }),
      },
    ],
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
