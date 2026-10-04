"use client";

/**
 * Key screens — the carousel at the top of a project page, above the story.
 *
 * Sits before the text on purpose. Most people scanning a portfolio decide
 * whether to read at all based on what the thing looks like, and the first
 * screenshot used to be several hundred pixels down, past three paragraphs.
 * This puts the product in front of the prose.
 *
 * One at a time rather than a row. Side by side, each screen got a quarter of
 * the column and the shots are not the same shape: a desktop capture is wide
 * and short, a phone capture is narrow and tall, so the desktop one shrank to a
 * thumbnail while the phone one ran taller than the viewport beside it. Neither
 * was readable at that size, which defeats the point of leading with them.
 *
 * The viewport holds one height and each image is contained inside it, so
 * stepping from a desktop shot to a phone shot doesn't resize the page. The
 * cost is letterboxing either side of a tall screen; that reads as deliberate
 * against the mount, where a shrunken screenshot just read as small.
 */

import { useState } from "react";

import { urlFor } from "@/lib/sanity/image";
import type { GalleryItem } from "@/lib/types";

export function KeyScreens({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState(0);

  const total = items.length;
  if (total === 0) return null;

  const go = (i: number) => setIndex(((i % total) + total) % total);
  const active = items[index];

  return (
    <section
      className="key-screens"
      aria-roledescription="carousel"
      aria-label="Key screens"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
        if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
      }}
    >
      <div className="key-screens-viewport">
        <div
          className="key-screens-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((item, i) => (
            <figure className="key-screen" key={i} aria-hidden={i !== index}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urlFor(item.image).width(1800).auto("format").url()}
                alt={item.caption ?? ""}
                loading={i === 0 ? "eager" : "lazy"}
                draggable={false}
              />
            </figure>
          ))}
        </div>

        {total > 1 && (
          <>
            <button
              className="slideshow-nav prev"
              aria-label="Previous screen"
              onClick={() => go(index - 1)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              className="slideshow-nav next"
              aria-label="Next screen"
              onClick={() => go(index + 1)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* One caption under the viewport rather than one per figure: only the
          active screen's caption is true at any moment. The row is reserved
          whether or not this screen has one, so stepping through doesn't shunt
          the dots and the story below them up and down. */}
      <p className="key-screens-caption">{active.caption ?? " "}</p>

      {total > 1 && (
        <div className="key-screens-dots">
          {items.map((_, i) => (
            <button
              key={i}
              className={`key-screens-dot${i === index ? " is-active" : ""}`}
              aria-label={`Screen ${i + 1} of ${total}`}
              aria-current={i === index}
              onClick={() => go(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
