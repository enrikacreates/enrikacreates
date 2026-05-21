/**
 * Home page — single-page experience (vanilla model restored).
 *
 * Logo hero → scroll-driven collage → "View Work" reveals the catalog below
 * on the SAME page and scrolls to it. Scrolling back up returns to the
 * animation. Project cards still open detail pages at /work/[slug].
 *
 * MIGRATION TEMPLATE NOTE:
 *   Server Component fetches all data once (settings + projects + featured),
 *   then hands the interactive collage + catalog to <HomeExperience> (client),
 *   which coordinates the reveal-and-scroll.
 */

import {
  getSiteSettings,
  getAllProjects,
  getFeaturedProjects,
} from "@/lib/sanity/fetch";
import { HeroLogo } from "@/components/HeroLogo";
import { HomeExperience } from "@/components/HomeExperience";

export default async function HomePage() {
  const [settings, projects, featured] = await Promise.all([
    getSiteSettings(),
    getAllProjects(),
    getFeaturedProjects(),
  ]);

  return (
    <>
      <HeroLogo
        tagline={settings?.tagline ?? "Designer. Builder. Storyteller."}
        statement={
          settings?.heroStatement ??
          "I design storytelling experiences that inspire hope and ignite purpose."
        }
      />

      <HomeExperience projects={projects} featured={featured} />
    </>
  );
}
