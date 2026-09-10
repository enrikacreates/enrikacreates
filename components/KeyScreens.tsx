/**
 * Key screens — the strip at the top of a project page, above the written story.
 *
 * Sits before the text on purpose. Most people scanning a portfolio decide
 * whether to read at all based on what the thing looks like, and until now the
 * first screenshot was several hundred pixels down, past three paragraphs. This
 * puts the product in front of the prose.
 *
 * Deliberately capped at four in the schema. It's the hook, not the tour: the
 * slideshow below the story is where a full walkthrough belongs.
 *
 * Server component; nothing here is interactive.
 */

import { urlFor } from "@/lib/sanity/image";
import type { GalleryItem } from "@/lib/types";

export function KeyScreens({ items }: { items: GalleryItem[] }) {
  if (items.length === 0) return null;

  return (
    <section
      className="key-screens"
      // The count drives the column rule in CSS: two screens want to be bigger
      // than four, and a fixed grid would shrink a pair to the same width.
      data-count={Math.min(items.length, 4)}
      aria-label="Key screens"
    >
      {items.map((item, i) => (
        <figure className="key-screen" key={i}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlFor(item.image).width(1200).auto("format").url()}
            alt={item.caption ?? ""}
            loading={i === 0 ? "eager" : "lazy"}
            draggable={false}
          />
          {item.caption && <figcaption>{item.caption}</figcaption>}
        </figure>
      ))}
    </section>
  );
}
