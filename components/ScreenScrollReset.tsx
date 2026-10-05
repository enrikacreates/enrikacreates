"use client";

import { useEffect } from "react";

/**
 * Returns a seated screen to its top when the pointer leaves the card.
 *
 * The rise is CSS and reverses itself; the scroll inside the screen is the
 * browser's own, and `scrollTop` has no idea the card is no longer hovered. So
 * a card someone scrolled halfway through stayed halfway through: it drops
 * back to peeking, and the next person to hover it gets a stranger's position,
 * mid-paragraph, with no sense that there is anything above.
 *
 * Pointer only. There is no leaving on touch, and resetting on scroll was the
 * thing we deliberately took out.
 */
export function ScreenScrollReset() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    const cards = [...document.querySelectorAll<HTMLElement>(
      ".catalog-item, .featured-cell"
    )].filter((card) => card.querySelector(".poster-screen"));
    if (!cards.length) return;

    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const reset = (event: Event) => {
      const screen = (event.currentTarget as HTMLElement).querySelector(
        ".poster-screen"
      );
      if (!(screen instanceof HTMLElement) || screen.scrollTop === 0) return;
      // Only once it has dropped back out of sight. Rewinding a screen that is
      // still on its way down shows the rewind, which looks like a glitch; this
      // way the card simply reopens at the top next time.
      window.setTimeout(() => {
        screen.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
      }, 420);
    };

    cards.forEach((card) => card.addEventListener("pointerleave", reset));
    return () =>
      cards.forEach((card) => card.removeEventListener("pointerleave", reset));
  }, []);

  return null;
}
