/**
 * Home page.
 *
 * Phase 3a (this commit): Logo hero ports from the vanilla site, statically
 * rendered with placeholder for the GSAP collage zone.
 *
 * Phase 3b adds: the scroll-driven collage animation (the soul of the page).
 * Phase 3c adds: the work catalog grid below the heroes.
 *
 * MIGRATION TEMPLATE NOTE:
 *   Page is a Server Component — fetches site settings at request time
 *   (cached 60s). Interactive bits (GSAP scroll, modals) become client
 *   components in their own files.
 */

import { getSiteSettings } from "@/lib/sanity/fetch";
import { HeroLogo } from "@/components/HeroLogo";

export default async function HomePage() {
  const settings = await getSiteSettings();

  return (
    <>
      <HeroLogo
        tagline={settings?.tagline ?? "Designer. Builder. Storyteller."}
        statement={
          settings?.heroStatement ??
          "I design storytelling experiences that inspire hope and ignite purpose."
        }
      />

      {/* GSAP collage scroll zone — placeholder until Phase 3b */}
      <section
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          padding: "4rem 2rem",
          background: "var(--off-white)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--text-dim)",
            textAlign: "center",
          }}
        >
          Phase 3b will land the GSAP collage scroll here
          <br />
          <a href="/studio" style={{ marginTop: "1.5rem", display: "inline-block" }}>
            Open Studio →
          </a>
        </p>
      </section>
    </>
  );
}
