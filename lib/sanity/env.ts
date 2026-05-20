/**
 * Sanity env vars — validated at module load.
 *
 * MIGRATION TEMPLATE NOTE:
 *   This file is the single source of truth for Sanity env var names.
 *   When copying to a new project: keep the variable names identical.
 *   Only NEXT_PUBLIC_SANITY_PROJECT_ID and the dataset value should differ
 *   between projects.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required env var: ${name}. ` +
        `Check .env.local and Vercel project settings.`
    );
  }
  return value;
}

export const projectId = required(
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
);

export const dataset = required(
  "NEXT_PUBLIC_SANITY_DATASET",
  process.env.NEXT_PUBLIC_SANITY_DATASET
);

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-12-01";

/**
 * Server-only token for reading drafts / preview content.
 * NOT exported as a constant — use `getReadToken()` to keep it server-only.
 */
export function getReadToken(): string | undefined {
  return process.env.SANITY_API_READ_TOKEN;
}
