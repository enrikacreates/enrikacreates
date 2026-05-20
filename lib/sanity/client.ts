import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

/**
 * Public Sanity client — reads published content via the CDN.
 * Safe to use in Server Components, Route Handlers, and client code.
 *
 * MIGRATION TEMPLATE NOTE:
 *   `useCdn: true` = faster, cached responses. Disable for write ops.
 *   `perspective: "published"` = drafts hidden by default. Switch to
 *   "previewDrafts" + a read token when wiring preview mode.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});
