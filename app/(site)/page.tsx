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
import { HeroCollage } from "@/components/HeroCollage";

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

      <HeroCollage />
    </>
  );
}
