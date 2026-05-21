"use client";

/**
 * Process gallery + lightbox.
 *
 * MIGRATION TEMPLATE NOTE:
 *   Port of vanilla initGallery() + lightbox functions. Grid of captioned
 *   images; clicking opens a fullscreen lightbox with prev/next, keyboard
 *   nav (Esc / arrows), and a caption + counter. Self-contained — lightbox
 *   markup lives inside this component (was a separate DOM node in vanilla).
 */

import { useState, useEffect, useCallback } from "react";
import { urlFor } from "@/lib/sanity/image";
import type { GalleryItem } from "@/lib/types";

export function Gallery({
  items,
  intro,
  title,
}: {
  items: GalleryItem[];
  intro?: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const total = items.length;
  const show = useCallback((i: number) => setIndex(((i % total) + total) % total), [total]);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("lightbox-open");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowLeft") show(index - 1);
      else if (e.key === "ArrowRight") show(index + 1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("lightbox-open");
    };
  }, [open, index, show]);

  if (total === 0) return null;

  const fullUrl = (item: GalleryItem) =>
    urlFor(item.image).width(1800).auto("format").url();

  return (
    <section className="project-gallery">
      <h2 className="project-section-title">Process</h2>
      {intro && <p className="project-section-intro">{intro}</p>}

      <div className="gallery-grid" id="gallery-grid">
        {items.map((item, i) => (
          <figure
            key={i}
            className={`gallery-item${item.caption ? " has-caption" : ""}`}
            style={{ cursor: "zoom-in" }}
            onClick={() => { setIndex(i); setOpen(true); }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urlFor(item.image).width(700).height(700).fit("crop").auto("format").url()}
              alt={item.caption || `${title} — process ${i + 1}`}
              loading="lazy"
            />
            {item.caption && <figcaption className="gallery-caption">{item.caption}</figcaption>}
          </figure>
        ))}
      </div>

      {/* Lightbox */}
      <div
        className={`lightbox${open ? " is-open" : ""}`}
        aria-hidden={!open}
        onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      >
        <button className="lightbox-close" aria-label="Close" onClick={() => setOpen(false)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <button className="lightbox-nav prev" aria-label="Previous" onClick={() => show(index - 1)}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className="lightbox-nav next" aria-label="Next" onClick={() => show(index + 1)}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {open && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="lightbox-image" src={fullUrl(items[index])} alt={items[index].caption || ""} />
        )}
        <p className="lightbox-caption">{items[index]?.caption || ""}</p>
        <span className="lightbox-counter">{index + 1} / {total}</span>
      </div>
    </section>
  );
}
