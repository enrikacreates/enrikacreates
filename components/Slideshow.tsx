"use client";

/**
 * Slideshow — chevron + dot navigation for the project Designs slides.
 *
 * MIGRATION TEMPLATE NOTE:
 *   Port of vanilla initSlideshow(). Transform-based track, keyboard arrows,
 *   dot indicators. State-driven instead of direct DOM manipulation.
 */

import { useState, useRef } from "react";
import { urlFor } from "@/lib/sanity/image";
import type { ProjectSlide } from "@/lib/types";

export function Slideshow({ slides, title }: { slides: ProjectSlide[]; title: string }) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const total = slides.length;

  if (total === 0) return null;

  const go = (i: number) => setIndex(((i % total) + total) % total);

  return (
    <section className="project-slideshow-section">
      <h2 className="project-section-title">Designs</h2>
      <div
        className="project-slideshow"
        id="project-slideshow"
        ref={ref}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
          if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
        }}
      >
        <div className="slideshow-viewport">
          <div
            className="slideshow-track"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((slide, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                className="slideshow-slide"
                src={urlFor(slide.image).width(1400).auto("format").url()}
                alt={slide.alt || `${title} — slide ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
              />
            ))}
          </div>
        </div>

        <button className="slideshow-nav prev" aria-label="Previous slide" onClick={() => go(index - 1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className="slideshow-nav next" aria-label="Next slide" onClick={() => go(index + 1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="slideshow-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`slideshow-dot${i === index ? " is-active" : ""}`}
              aria-label={`Slide ${i + 1}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
