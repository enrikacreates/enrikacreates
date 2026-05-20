import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "./client";

/**
 * Image URL builder — produces Sanity CDN URLs with transforms.
 *
 * Usage:
 *   urlFor(asset).width(1200).height(800).fit("crop").auto("format").url()
 *
 * MIGRATION TEMPLATE NOTE:
 *   Sanity images include hotspot/crop metadata. The builder respects both
 *   automatically when you call `.fit("crop")`. No manual cropping logic.
 */
const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
