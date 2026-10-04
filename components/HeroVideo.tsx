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
 *   1.1  current: a touch of hold at the start, then essentially native
 *   1.8  previous, and too much: only 5% of the reveal had happened by the
 *        time the wordmark scrolled away, which read as the animation waiting
 *        for the logo to leave before starting
 *
 * Raise it to hold the leaves closed for longer, lower it toward 1 to let the
 * clip run at its native pace.
 */
const TIME_CURVE = 1.1;

/**
 * How hard the playhead chases its target, expressed per 60fps frame and then
 * converted to wall-clock time in the loop. Lower is smoother/laggier.
 */
const LERP = 0.12;

/** Don't touch currentTime for sub-frame deltas; seeking is not free. */
const MIN_SEEK_DELTA = 1 / 48;

export function HeroVideo({ onViewWork }: { onViewWork?: () => void }) {
  const zoneRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const cueRef = useRef<HTMLAnchorElement>(null);

  /**
   * Where the playhead should be. Where it IS is read off the element itself,
   * so the easing can't accumulate a lead on the frame actually showing.
   */
  const target = useRef(0);
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

    /**
     * Scroll position through the reveal, 0 to 1.
     *
     * Measured from the document top rather than from the moment the pin
     * sticks. Anchoring to the pin meant the first stretch of scroll (the whole
     * height of the logo section above this zone) moved nothing at all, which
     * read as lag before the animation would start. Now the very first scroll
     * pixel advances the reveal.
     */
    function progress() {
      const rect = zone!.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      if (travel <= 0) return 0;
      const zoneTopInDoc = rect.top + window.scrollY;
      const total = zoneTopInDoc + travel;
      if (total <= 0) return 0;
      return Math.min(1, Math.max(0, window.scrollY / total));
    }

    /** Fade the quote and the cue in over their own slices of the scroll.
     *  Pulled earlier so the text lands while the collage is still opening,
     *  instead of leaving a long stretch of empty cream below it. */
    function paintOverlays(p: number) {
      const band = (from: number, to: number) =>
        Math.min(1, Math.max(0, (p - from) / (to - from)));

      const quoteAt = band(0.44, 0.6);
      if (quoteRef.current) {
        quoteRef.current.style.opacity = String(quoteAt);
        // The quote is centred with translateX(-50%) in CSS, so the rise has to
        // be written as a combined transform or it loses its centring.
        quoteRef.current.style.transform =
          `translate(-50%, ${(1 - quoteAt) * 20}px)`;
      }

      const cueAt = band(0.72, 0.86);
      if (cueRef.current) {
        cueRef.current.style.opacity = String(cueAt);
        cueRef.current.style.transform = `translateY(${(1 - cueAt) * 10}px)`;
        cueRef.current.style.pointerEvents = cueAt > 0.5 ? "auto" : "none";
      }

    }

    function onScroll() {
      const p = progress();
      const duration = video!.duration || 0;
      target.current = Math.pow(p, TIME_CURVE) * duration;
      paintOverlays(p);
    }

    /**
     * One seek in flight at a time.
     *
     * Assigning `currentTime` while the element is still servicing a seek
     * cancels that seek and starts another. The rAF loop was assigning on every
     * frame, so a fast scroll back to the top issued ~60 cancellations a second
     * and the decoder never finished one: readyState fell from 4 (HAVE_ENOUGH)
     * to 1 (HAVE_METADATA), and with no decoded frame the element painted
     * nothing. The old `readyState >= 2` guard then made it permanent, because
     * at readyState 1 the loop stopped seeking at all and could never climb
     * back out. That is the blank hero on the way back up.
     *
     * So: issue a seek only when none is pending, and let the next frame pick
     * up wherever the playhead has eased to by then. The target keeps updating
     * meanwhile, so nothing is queued or replayed, and the seek rate throttles
     * itself to whatever the decoder can actually sustain.
     */
    let seeking = false;
    let seekStarted = 0;
    let lastFrame = performance.now();

    /**
     * Shortest gap between seeks, in ms.
     *
     * Waiting for every `seeked` before issuing the next one was too strict:
     * the playhead then advanced once per completed seek, so a slow seek read
     * as a hold followed by a catch-up leap. Measured end to end down the zone,
     * the steps came out 0.2, 0.46, 0, 0.98, 0, 1.03 seconds of video. That is
     * the racing.
     *
     * The original fault was re-targeting on every rAF, which at 60/s cancelled
     * each seek before the decoder could finish and collapsed readyState. The
     * cure is a floor on the rate, not a ban: pre-empt a seek that has been
     * pending longer than this, and otherwise take the `seeked` as soon as it
     * lands. Fast seeks stay frame-rate smooth, slow ones degrade to ~20/s
     * instead of stalling outright.
     */
    const MIN_SEEK_INTERVAL = 45;
    const releaseSeek = () => {
      seeking = false;
    };
    video.addEventListener("seeked", releaseSeek);
    video.addEventListener("error", releaseSeek);

    function tick() {
      if (!running) return;

      const v = video!;
      // A seek needs metadata (readyState >= 1) and a real duration, not a
      // decoded frame. Gating on >= 2 is what trapped it when a frame was the
      // very thing a seek would have produced.
      const seekable =
        v.readyState >= 1 && Number.isFinite(v.duration) && v.duration > 0;

      const now = performance.now();
      const dt = Math.min(0.1, (now - lastFrame) / 1000);
      lastFrame = now;

      // A pending seek only blocks the next one until the interval is up; past
      // that we re-target rather than let the reveal sit still. This doubles as
      // the watchdog, so a dropped `seeked` can't wedge the loop shut.
      const free = !seeking || now - seekStarted > MIN_SEEK_INTERVAL;

      if (free && seekable) {
        // Ease from where the playhead ACTUALLY is, not from a free-running
        // variable. Easing a separate value meant it kept advancing during a
        // seek, so a slow seek let it run far ahead and the next one jumped
        // straight there: the reveal held, then raced to catch up.
        //
        // And ease in wall-clock time, not per frame. We now step once per
        // completed seek rather than once per rAF, so a fixed per-frame
        // fraction would scrub at whatever rate the decoder happened to manage.
        // This keeps the same feel whether that is 60 steps a second or 20.
        const from = v.currentTime;
        const k = 1 - Math.pow(1 - LERP, dt * 60);
        const next = from + (target.current - from) * k;

        if (Math.abs(next - from) > MIN_SEEK_DELTA) {
          seeking = true;
          seekStarted = now;
          v.currentTime = next;
        }
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
      if (video!.readyState >= 1 && Number.isFinite(video!.duration)) {
        video!.currentTime = video!.duration;
      }
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
      video.removeEventListener("seeked", releaseSeek);
      video.removeEventListener("error", releaseSeek);
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

      </div>
    </section>
  );
}
