/**
 * Sanity CLI config — used by `npx sanity` commands (typegen, dataset export, etc.)
 *
 * MIGRATION TEMPLATE NOTE: only the projectId/dataset values change per project;
 *   keep the file structure identical for portability.
 */

import { defineCliConfig } from "sanity/cli";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

export default defineCliConfig({
  api: { projectId, dataset },
  /**
   * Enable auto-updates of studio versions.
   */
  autoUpdates: true,
});
