"use client";

/**
 * Home experience — the scrubbed hero followed by the work catalog.
 *
 * The catalog used to be hidden (display:none) until "View Work" was clicked.
 * It now simply follows the hero in normal document flow, so continuing to
 * scroll past the reveal carries you straight into the work. The cue is a
 * scroll affordance rather than a switch: it points at where you are already
 * heading instead of gating it.
 *
 * The hero is <HeroVideo> (scroll-scrubbed clip); the old GSAP layer timeline
 * lives on in HeroCollage.tsx until the video is signed off.
 */

import { useCallback, useEffect, useRef } from "react";
import { HeroVideo } from "./HeroVideo";
import { WorkSection } from "./WorkSection";
import type { Category, ProjectListItem } from "@/lib/types";

interface HomeExperienceProps {
  projects: ProjectListItem[];
  featured: ProjectListItem[];
  categories: Category[];
  /** The logo hero, rendered on the server and slotted into the sticky stage. */
  heroLogo: React.ReactNode;
}

/**
 * The wordmark settles in two moves, both driven by scroll distance.
 *
 *   1. Collapse: full hero lockup shrinks to a compact masthead, still centred.
 *   2. Hand-off: the centred wordmark fades out while a fixed corner mark fades
 *      in. This was a slide at first, but travelling the wordmark across the
 *      screen read as a gimmick; a cross-fade is quieter and lands the same
 *      place. The corner mark is fixed, so it stays put past the hero.
 *
 * It stays stuck at the top throughout either way; these only control pacing.
 */
const LOGO_COLLAPSE_PX = 420;
const LOGO_SHIFT_START_PX = 460;
const LOGO_SHIFT_END_PX = 900;

/** Must match --hero-nav-height. The collapsed bar the wordmark settles into. */
const NAV_HEIGHT_PX = 72;

/** Sticky block sizing: the larger of this share of the viewport, or the lockup. */
const LOGO_BLOCK_BASE_VH = 0.34;
const LOGO_BLOCK_PADDING_PX = 28;

export function HomeExperience({
  projects,
  featured,
  categories,
  heroLogo,
}: HomeExperienceProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  /**
   * The logo is sticky for the length of the hero stage, so it never scrolls
   * away mid-animation. Two scroll-driven customs do the rest, both consumed by
   * CSS as transforms and opacity only, so neither costs any layout:
   * --logo-collapse (shrink) and --logo-shift (hand off to the corner mark).
   */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // Written straight from the scroll handler rather than deferred to rAF:
    // this only sets two custom properties, and going through rAF meant the
    // masthead silently stopped updating wherever rAF is throttled.
    const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

    function apply() {
      const y = window.scrollY;
      stage!.style.setProperty(
        "--logo-collapse",
        clamp01(y / LOGO_COLLAPSE_PX).toFixed(4)
      );
      stage!.style.setProperty(
        "--logo-shift",
        clamp01(
          (y - LOGO_SHIFT_START_PX) / (LOGO_SHIFT_END_PX - LOGO_SHIFT_START_PX)
        ).toFixed(4)
      );
    }
    /**
     * The sticky block has a fixed height (the collage pin is positioned off it)
     * and clips, so it has to be tall enough for the lockup at the current
     * width. Chasing that with breakpoints kept failing by a few pixels as the
     * statement rewrapped, so it is derived from the content instead: 34vh
     * unless the lockup genuinely needs more.
     */
    function measureLogoHeight() {
      const inner = stage!.querySelector<HTMLElement>(".hero-logo-inner");
      if (!inner) return;
      const needed = inner.scrollHeight + LOGO_BLOCK_PADDING_PX;
      const base = window.innerHeight * LOGO_BLOCK_BASE_VH;
      stage!.style.setProperty(
        "--hero-logo-height",
        `${Math.round(Math.max(base, needed))}px`
      );
    }

    /**
     * How far up the lockup travels to centre the collapsed wordmark in the nav
     * bar. Computed from layout offsets rather than getBoundingClientRect, so
     * the transform already applied can't feed back into its own input.
     */
    function measureRise() {
      const mark = stage!.querySelector<HTMLElement>(".logomark");
      const inner = stage!.querySelector<HTMLElement>(".hero-logo-inner");
      if (!mark || !inner) return;

      const markCentreInBlock =
        inner.offsetTop + mark.offsetTop + mark.offsetHeight / 2;
      stage!.style.setProperty(
        "--logo-rise-distance",
        `${NAV_HEIGHT_PX / 2 - markCentreInBlock}px`
      );
    }

    function onResize() {
      // Height first: the rise measurement depends on the resulting layout.
      measureLogoHeight();
      measureRise();
      apply();
    }

    onResize();
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", apply);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  // The catalog is always in the document, so this is purely a scroll jump.
  // /#work still works on arrival without any JS, for the same reason.
  const scrollToWork = useCallback(() => {
    document
      .getElementById("work")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <>
      {/* One stage so the wordmark stays stuck until the whole hero is done. */}
      <div className="hero-stage" ref={stageRef}>
        {heroLogo}

        {/* Fades in as the centred wordmark fades out. Fixed, so it holds the
            corner once the hero stage has released. Decorative: the real
            heading lives in the lockup above. */}
        <div className="hero-nav-mark" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/enrikamark2.svg" alt="" draggable={false} />
        </div>

        <HeroVideo onViewWork={scrollToWork} />
      </div>

      <WorkSection
        projects={projects}
        featured={featured}
        categories={categories}
      />
    </>
  );
}
