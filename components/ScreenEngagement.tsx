"use client";

import { useEffect } from "react";

/**
 * Gives touch devices the engagement that hover gives everyone else.
 *
 * The seated screens rest low, peeking, and rise when a card is hovered. A
 * phone has no hover: `(hover: hover)` is false and `:hover` never fires, so
 * without this a phone would see the peek and nothing else -- strictly worse
 * than the whole screen it used to show.
 *
 * A card entering the viewport is the closest thing touch has to hover: it is
 * the moment someone's thumb has brought it to them. Each card performs once,
 * as it is reached, rather than the whole grid going off at once.
 *
 * Only on coarse pointers. On a desktop this would fight the cursor, opening
 * cards nobody pointed at.
 */
export function ScreenEngagement() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = document.querySelectorAll<HTMLElement>(
      ".catalog-item, .featured-cell"
    );
    if (!cards.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-engaged");
          // Once. Re-triggering on every scroll past would turn a reveal into
          // a twitch, and the card has already said what it has to say.
          observer.unobserve(entry.target);
        }
      },
      // Most of the card has to be in frame, so it performs where it can be
      // watched rather than from the edge of the screen on the way past.
      { threshold: 0.6 }
    );

    cards.forEach((card) => {
      if (card.querySelector(".poster-screen")) observer.observe(card);
    });
    return () => observer.disconnect();
  }, []);

  return null;
}
