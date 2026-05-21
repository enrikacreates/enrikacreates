"use client";

/**
 * Hero 2 — scroll-driven collage (the soul of the home page).
 *
 * MIGRATION TEMPLATE NOTE:
 *   Faithful port of the vanilla setupCollageScroll() GSAP timeline.
 *   - All animation values copied 1:1 from the original (t=0, d=0.85, scrub=2.0).
 *   - gsap.context() scoped to the root ref gives automatic cleanup on unmount
 *     (the modern GSAP + React pattern — no manual ScrollTrigger.kill needed).
 *   - Layers defined as a data array to keep the JSX clean; z-index + animation
 *     target the same #layer-* IDs the vanilla CSS already styles.
 *
 *   The mirrored-palm enhancement (duplicate palm-right, flipped) lands AFTER
 *   this faithful port is verified — see LAYERS array + the palm-right tween.
 */

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

/** Layer paint order (back → front) — matches vanilla DOM order exactly. */
const LAYERS: { id: string; src: string }[] = [
  // Background shapes
  { id: "layer-bg-orange", src: "/assets/layers/image02.png" },
  { id: "layer-bg-blue", src: "/assets/layers/image19.png" },
  { id: "layer-bg-triangle", src: "/assets/layers/image01.png" },
  { id: "layer-bg-stripes", src: "/assets/layers/image03.png" },
  // Portrait (behind plants at start)
  { id: "layer-portrait", src: "/assets/layers/image07.png" },
  // Plants / foliage
  { id: "layer-leaf-2", src: "/assets/layers/image09.png" },
  { id: "layer-leaf-large", src: "/assets/layers/image17.png" },
  { id: "layer-banana", src: "/assets/layers/image06.png" },
  { id: "layer-palm-left", src: "/assets/layers/image04.png" },
  { id: "layer-palm-right", src: "/assets/layers/image05.png" },
  // Mirrored duplicate of palm-right — flipped to hide the blunt edge where
  // the two join in the center. Tweak x/rotation below to refine the seam.
  { id: "layer-palm-right-mirror", src: "/assets/layers/image05.png" },
  { id: "layer-leaf-1", src: "/assets/layers/image08.png" },
  { id: "layer-leaf-3", src: "/assets/layers/image13.png" },
  { id: "layer-leaf-4", src: "/assets/layers/image16.png" },
  // Foreground objects
  { id: "layer-mic", src: "/assets/layers/image23.png" },
  { id: "layer-heart", src: "/assets/layers/image22.png" },
  { id: "layer-sunflower", src: "/assets/layers/image21.png" },
  { id: "layer-typewriter", src: "/assets/layers/image18.png" },
  { id: "layer-camera", src: "/assets/layers/image12.png" },
  { id: "layer-soundwave", src: "/assets/layers/image11.png" },
  { id: "layer-cassette", src: "/assets/layers/image20.png" },
  { id: "layer-brain", src: "/assets/layers/image14.png" },
  { id: "layer-lightbulb", src: "/assets/layers/image15.png" },
  { id: "layer-hummingbird", src: "/assets/layers/image10.png" },
  { id: "layer-sewing", src: "/assets/layers/image24.png" },
  { id: "layer-colorchips", src: "/assets/layers/image25.png" },
];

export function HeroCollage() {
  const rootRef = useRef<HTMLElement>(null);
  const router = useRouter();

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;

    // Dynamic import keeps GSAP out of the server bundle.
    (async () => {
      const gsapMod = await import("gsap");
      const stMod = await import("gsap/ScrollTrigger");
      const gsap = gsapMod.default ?? gsapMod.gsap;
      const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const zone = "#hero-zone";
        const progressFill = document.getElementById("hero-progress-fill");

        // Progress bar
        ScrollTrigger.create({
          trigger: zone,
          start: "top bottom",
          end: "bottom bottom",
          onUpdate: (self: { progress: number }) => {
            if (progressFill)
              progressFill.style.width = `${self.progress * 100}%`;
          },
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: zone,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 2.0,
          },
        });

        gsap.set("#hero-collage", { opacity: 1 });

        const t = 0.0;
        const d = 0.85;

        // Portrait — rises and is revealed as plants spread away
        tl.fromTo("#layer-portrait", { y: 600, scale: 0.65 }, { y: -80, scale: 1, duration: d }, t);

        // Plants spread outward
        tl.fromTo("#layer-banana", { x: 0, y: 0 }, { x: -200, y: -20, duration: d }, t);
        tl.fromTo("#layer-palm-left", { x: 0, y: 0, scaleX: -1, rotation: 0 }, { x: -120, y: 30, scaleX: -1, rotation: -20, duration: d }, t);
        tl.fromTo("#layer-palm-right", { x: 0, rotation: 0 }, { x: 10, rotation: -12, duration: d }, t);
        // Mirrored palm — flipped IN PLACE around the frond's own center
        // (transformOrigin ~78% = where the palm sits) so it stays at the
        // same x,y as palm-right and just mirrors, masking the blunt edge.
        // Tracks palm-right's spread so the pair moves together.
        tl.fromTo(
          "#layer-palm-right-mirror",
          { x: 0, rotation: 0, scaleX: -1, transformOrigin: "63% 50%" },
          { x: 10, rotation: -12, scaleX: -1, transformOrigin: "63% 50%", duration: d },
          t
        );
        tl.fromTo("#layer-leaf-2", { y: 0 }, { y: 280, duration: d }, t);
        tl.fromTo("#layer-leaf-large", { y: 0 }, { y: 280, duration: d }, t);
        tl.fromTo("#layer-leaf-1", { y: 0 }, { y: 250, duration: d }, t);
        tl.fromTo("#layer-leaf-3", { x: 0, y: 0 }, { x: -40, y: -40, duration: d }, t);
        tl.fromTo("#layer-leaf-4", { x: 0, y: 0 }, { x: 120, y: 80, duration: d }, t);

        // Foreground objects — lifted up to clear the bottom crop
        tl.fromTo("#layer-typewriter", { x: 0, y: 0 }, { x: 220, y: -200, duration: d }, t);
        tl.fromTo("#layer-camera", { x: 0, y: 0, rotation: 0 }, { x: -50, y: -180, rotation: 10, duration: d }, t);
        tl.fromTo("#layer-mic", { x: 0, y: 0 }, { x: -60, y: -90, duration: d }, t);
        tl.fromTo("#layer-soundwave", { x: 150, opacity: 0 }, { x: 30, y: -90, opacity: 1, duration: d }, t);
        tl.fromTo("#layer-heart", { x: 0, y: 0, scale: 1 }, { x: -310, y: -120, scale: 0.75, duration: d }, t);
        tl.fromTo("#layer-sunflower", { x: 0, y: 0 }, { x: -150, y: -170, rotation: -20, duration: d }, t);
        tl.fromTo("#layer-cassette", { x: 0, y: 0, rotation: 0 }, { x: -100, y: -180, rotation: -40, duration: d }, t);
        tl.fromTo("#layer-sewing", { x: 0, y: 0, rotation: 0 }, { x: -180, y: -150, rotation: -5, duration: d }, t);
        tl.fromTo("#layer-colorchips", { x: 0, y: 0, rotation: 0 }, { x: 170, y: -170, rotation: 8, duration: d }, t);

        // Small details
        tl.fromTo("#layer-brain", { x: 0, y: 0 }, { x: 100, y: -120, duration: d }, t);
        tl.fromTo("#layer-lightbulb", { y: 0, rotation: 0 }, { y: -300, rotation: 20, duration: d }, t);
        tl.fromTo("#layer-hummingbird", { x: 0, y: 0, rotation: 0 }, { x: -190, y: -440, rotation: -12, duration: d }, t);

        // Background shapes
        tl.fromTo("#layer-bg-orange", { scale: 0.85 }, { scale: 1.15, duration: d }, t);
        tl.fromTo("#layer-bg-blue", { scale: 0.85, x: 0, y: 0 }, { scale: 1.1, x: 70, y: -80, duration: d }, t);
        tl.fromTo("#layer-bg-triangle", { x: 0, rotation: 0 }, { x: -80, rotation: -20, duration: d }, t);
        tl.fromTo("#layer-bg-stripes", { x: 0 }, { x: 80, duration: d }, t);

        // Mid-spread: plants drop behind portrait
        const plantsBack =
          "#layer-palm-left, #layer-palm-right, #layer-palm-right-mirror, #layer-banana, #layer-leaf-1, #layer-leaf-2, #layer-leaf-3, #layer-leaf-4";
        tl.set(plantsBack, { zIndex: 2 }, 0.5);

        // Designer quote fades in mid-spread
        tl.fromTo("#hero-quote", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.2 }, 0.55);

        // View Work cue fades in during last leg
        tl.fromTo("#view-work-cue", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.15 }, 0.85);
      }, rootRef);

      // Refresh once images settle, so trigger positions are accurate.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    })();

    return () => ctx?.revert();
  }, []);

  function handleViewWork(e: React.MouseEvent) {
    e.preventDefault();
    // Phase 3c will wire this to the catalog. For now, route to /work.
    router.push("/work");
  }

  return (
    <section className="hero-collage-zone" id="hero-zone" ref={rootRef}>
      <div className="hero-pin">
        <div className="hero-collage" id="hero-collage">
          {LAYERS.map((layer) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={layer.id}
              className="collage-layer"
              id={layer.id}
              src={layer.src}
              alt=""
              draggable={false}
            />
          ))}
        </div>

        {/* Designer quote — fades in during the spread */}
        <blockquote className="hero-quote" id="hero-quote">
          <p>&ldquo;If you can design one thing, you can design everything.&rdquo;</p>
          <cite>Massimo Vignelli</cite>
        </blockquote>

        {/* View Work cue */}
        <a
          href="/work"
          className="view-work-cue"
          id="view-work-cue"
          onClick={handleViewWork}
        >
          <p className="view-work-text">View Work</p>
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

        {/* Progress bar */}
        <div className="hero-progress">
          <div className="hero-progress-fill" id="hero-progress-fill" />
        </div>
      </div>
    </section>
  );
}
