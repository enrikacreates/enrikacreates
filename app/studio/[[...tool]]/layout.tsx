/**
 * Studio layout — bypasses site chrome (Sanity Studio styles itself fully).
 * Metadata/viewport come from next-sanity to get the correct iframe-safe defaults.
 */

export { metadata, viewport } from "next-sanity/studio";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
