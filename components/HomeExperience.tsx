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
 *   2. Shift: once collapsed, it slides left into the corner, clearing the
 *      centre for the collage and putting real distance between it and the
 *      EMAIL / NEWSLETTER links on the right.
 *
 * It stays stuck at the top throughout either way; these only control pacing.
 */
const LOGO_COLLAPSE_PX = 420;
const LOGO_SHIFT_START_PX = 460;
const LOGO_SHIFT_END_PX = 900;

/** Must match the scale factor in .hero-logo .logomark. */
const LOGO_COLLAPSE_SCALE = 0.34;

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
   * --logo-collapse (shrink) and --logo-shift (slide to the corner).
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
     * How far left the lockup has to travel to sit against the margin.
     *
     * This cannot be a fixed vw value: the wordmark starts centred, so the
     * distance depends on both viewport width and the collapsed mark width, and
     * a constant that lands correctly at 894px overshoots off-screen at 1440px.
     * The left margin is read off the EMAIL / NEWSLETTER block so the two ends
     * of the masthead are inset by exactly the same amount.
     */
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

    function measureShift() {
      const mark = stage!.querySelector<HTMLElement>(".logomark");
      if (!mark) return;

      // clientWidth, not innerWidth: innerWidth includes the scrollbar, but the
      // lockup is centred within the content box. Mixing the two left the
      // wordmark short of the margin by exactly the scrollbar width.
      const viewport = document.documentElement.clientWidth;

      const actions = document.querySelector(".top-actions");
      const pad = actions
        ? viewport - actions.getBoundingClientRect().right
        : 32;

      const collapsedWidth = mark.offsetWidth * (1 - LOGO_COLLAPSE_SCALE);
      const distance = viewport / 2 - collapsedWidth / 2 - pad;
      stage!.style.setProperty("--logo-shift-distance", `${-distance}px`);
    }

    function onResize() {
      // Height first: the shift measurement depends on the resulting layout.
      measureLogoHeight();
      measureShift();
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
