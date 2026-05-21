/**
 * Color helpers — ported 1:1 from vanilla isDarkColor().
 *
 * MIGRATION TEMPLATE NOTE:
 *   Used to decide whether a card needs light or dark text based on its
 *   background color's perceived luminance. Threshold 0.6 matches vanilla.
 */

export function isDarkColor(hex?: string): boolean {
  if (!hex || hex[0] !== "#" || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return L < 0.6;
}

/** Category labels for the filter bar (order matters). */
export const FILTER_LABELS: Record<string, string> = {
  all: "All",
  web: "Web",
  apps: "Apps",
  product: "Product",
  fashion: "Fashion",
  event: "Event",
  writing: "Writing",
};
