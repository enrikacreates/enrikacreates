import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

/**
 * Server-only Sanity client with the WRITE token.
 *
 * MIGRATION TEMPLATE NOTE:
 *   `import "server-only"` guarantees this never gets bundled into client code
 *   (a build error if it does), keeping the write token off the browser.
 *   Use ONLY in Route Handlers / Server Actions — never in components.
 */
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
