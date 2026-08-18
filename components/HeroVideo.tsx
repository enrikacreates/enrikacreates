"use client";

/**
 * Hero 2 — scroll-scrubbed video (replaces the GSAP collage timeline).
 *
 * The collage animation is now a rendered video whose playhead is driven by
 * scroll position rather than by time. Nothing ever "plays": we only ever set
 * `currentTime`, which is why the clip is encoded all-keyframe (see
 * public/assets/hero/). Seeking a normal GOP encode would decode from the
 * previous keyframe on every frame and feel like mud.
 *
 * Three things make this feel right rather than merely work:
 *
 *   1. Smoothing. Scroll events are coarse and bursty, so we lerp the playhead
 *      toward its target in a rAF loop instead of snapping to it. This is the
 *      single biggest difference between "scrubby" and "silky".
 *   2. A time curve. The clip front-loads its reveal, so a linear mapping
 *      finishes the story halfway down the scroll. TIME_CURVE stretches the
 *      early part of the clip over more scroll distance. See the constant.
 *   3. An iOS unlock. Mobile Safari refuses to render seeks on a video that
 *      has never been played, so we play/pause once, muted, on first contact.
 */

import { useRef, useEffect, useCallback } from "react";

/** Matches the encode in public/assets/hero/. */
const SRC = "/assets/hero/hero-reveal.mp4";
const POSTER = "/assets/hero/hero-poster.jpg";

/**
 * Exponent applied to scroll progress before mapping to video time.
 *
 *   1.0  linear, the clip's own pacing
 *   1.8  current: early frames get more scroll, so the reveal lands late
 *
 * Raise it to hold the leaves closed for longer, lower it toward 1 to let the
 * clip run at its native pace.
 */
const TIME_CURVE = 1.8;

/** How hard the playhead chases its target each frame. Lower is smoother/laggier. */
const LERP = 0.12;

/** Don't touch currentTime for sub-frame deltas; seeking is not free. */
const MIN_SEEK_DELTA = 1 / 48;

export function HeroVideo({ onViewWork }: { onViewWork?: () => void }) {
  const zoneRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const cueRef = useRef<HTMLAnchorElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  /** Where the playhead should be, and where it currently is. */
  const target = useRef(0);
  const current = useRef(0);
  const unlocked = useRef(false);

  /** Mobile Safari won't paint a seek until the element has played once. */
  const unlock = useCallback(() => {
    const v = videoRef.current;
    if (!v || unlocked.current) return;
    unlocked.current = true;
    v.play()
      .then(() => v.pause())
      .catch(() => {
        /* Autoplay refused; seeking usually still works on desktop. */
      });
  }, []);

  useEffect(() => {
    const zone = zoneRef.current;
    const video = videoRef.current;
    if (!zone || !video) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let running = true;

    /** Scroll position through the sticky zone, 0 to 1. */
    function progress() {
      const rect = zone!.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      if (travel <= 0) return 0;
      return Math.min(1, Math.max(0, -rect.top / travel));
    }

    /** Fade the quote and the cue in over their own slices of the scroll. */
    function paintOverlays(p: number) {
      const band = (from: number, to: number) =>
        Math.min(1, Math.max(0, (p - from) / (to - from)));

      const quoteAt = band(0.5, 0.68);
      if (quoteRef.current) {
        quoteRef.current.style.opacity = String(quoteAt);
        // The quote is centred with translateX(-50%) in CSS, so the rise has to
        // be written as a combined transform or it loses its centring.
        quoteRef.current.style.transform =
          `translate(-50%, ${(1 - quoteAt) * 20}px)`;
      }

      const cueAt = band(0.84, 0.96);
      if (cueRef.current) {
        cueRef.current.style.opacity = String(cueAt);
        cueRef.current.style.transform = `translateY(${(1 - cueAt) * 10}px)`;
        cueRef.current.style.pointerEvents = cueAt > 0.5 ? "auto" : "none";
      }

      if (fillRef.current) fillRef.current.style.width = `${p * 100}%`;
    }

    function onScroll() {
      const p = progress();
      const duration = video!.duration || 0;
      target.current = Math.pow(p, TIME_CURVE) * duration;
      paintOverlays(p);
    }

    function tick() {
      if (!running) return;
      // Ease the playhead toward the target rather than snapping to it.
      current.current += (target.current - current.current) * LERP;
      if (
        video!.readyState >= 2 &&
        Math.abs(video!.currentTime - current.current) > MIN_SEEK_DELTA
      ) {
        video!.currentTime = current.current;
      }
      raf = requestAnimationFrame(tick);
    }

    /**
     * Reduced motion: no scrubbing at all. Park the clip on its final frame so
     * the hero still reads as the finished collage.
     */
    function settleForReducedMotion() {
      const p = progress();
      paintOverlays(p);
      if (video!.readyState >= 2) video!.currentTime = video!.duration || 0;
    }

    if (reduced.matches) {
      const onMeta = () => settleForReducedMotion();
      video.addEventListener("loadedmetadata", onMeta);
      window.addEventListener("scroll", settleForReducedMotion, { passive: true });
      return () => {
        video.removeEventListener("loadedmetadata", onMeta);
        window.removeEventListener("scroll", settleForReducedMotion);
      };
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    video.addEventListener("loadedmetadata", onScroll);
    onScroll();
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      video.removeEventListener("loadedmetadata", onScroll);
    };
  }, []);

  function handleViewWork(e: React.MouseEvent) {
    e.preventDefault();
    onViewWork?.();
  }

  return (
    <section
      className="hero-collage-zone"
      id="hero-zone"
      ref={zoneRef}
      onPointerDown={unlock}
      onTouchStart={unlock}
    >
      <div className="hero-pin hero-pin--video">
        <video
          ref={videoRef}
          className="hero-video"
          src={SRC}
          poster={POSTER}
          preload="auto"
          muted
          playsInline
          // Never controlled by the user; the scroll is the transport.
          tabIndex={-1}
          aria-hidden="true"
        />

        <blockquote className="hero-quote" id="hero-quote" ref={quoteRef}>
          <p>&ldquo;If you can design one thing, you can design everything.&rdquo;</p>
          <cite>Massimo Vignelli</cite>
        </blockquote>

        <a
          href="#work"
          className="view-work-cue"
          id="view-work-cue"
          ref={cueRef}
          onClick={handleViewWork}
        >
          <p className="view-work-text">View My Work</p>
          <svg
            className="view-work-chevron"
            width="20"
            height="12"
            viewBox="0 0 20 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 1L10 10L19 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>

        <div className="hero-progress">
          <div className="hero-progress-fill" id="hero-progress-fill" ref={fillRef} />
        </div>
      </div>
    </section>
  );
}
