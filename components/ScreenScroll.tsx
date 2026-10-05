"use client";

import { useEffect } from "react";

/**
 * The two things a natively-scrolling screen cannot do for itself.
 *
 * It cannot rewind. The rise is CSS and reverses on its own, but the scroll
 * inside the screen belongs to the browser and `scrollTop` has no idea the card
 * was abandoned: one left halfway through stayed halfway through, so the next
 * hover opened on a stranger's position, mid-paragraph.
 *
 * And it cannot retire its own hint. "Scroll to view more" is an instruction;
 * once someone is scrolling they have taken it, and a prompt that keeps telling
 * you to do the thing you are already doing stops being help. It comes back
 * when the screen returns to the top, because by then the instruction is true
 * again.
 *
 * Pointer only. There is no leaving on touch, and on touch the hint is the
 * only thing announcing the screen can move at all.
 */
export function ScreenScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    const cards = [...document.querySelectorAll<HTMLElement>(
      ".catalog-item, .featured-cell"
    )].filter((card) => card.querySelector(".poster-screen"));
    if (!cards.length) return;

    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];

    for (const card of cards) {
      const screen = card.querySelector<HTMLElement>(".poster-screen");
      if (!screen) continue;

      const onScroll = () => {
        // A few pixels of tolerance: a trackpad can leave 1-2px behind and the
        // hint should not flicker back on for that.
        card.classList.toggle("is-scrolled", screen.scrollTop > 4);
      };

      const onLeave = () => {
        if (screen.scrollTop === 0) return;
        // Only once it has dropped back out of sight. Rewinding a screen still
        // on its way down shows the rewind, which reads as a glitch.
        window.setTimeout(() => {
          screen.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
        }, 420);
      };

      screen.addEventListener("scroll", onScroll, { passive: true });
      card.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        screen.removeEventListener("scroll", onScroll);
        card.removeEventListener("pointerleave", onLeave);
        card.classList.remove("is-scrolled");
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
