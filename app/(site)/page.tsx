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
  getListedProjects,
  getFeaturedProjects,
  getListedCategories,
} from "@/lib/sanity/fetch";
import { HeroLogo } from "@/components/HeroLogo";
import { HomeExperience } from "@/components/HomeExperience";
import { rotateFeatured } from "@/lib/featuredRotation";

export default async function HomePage() {
  // Public surfaces show public categories only. The full set lives at /all.
  const [settings, projects, featuredPool, categories] = await Promise.all([
    getSiteSettings(),
    getListedProjects(),
    getFeaturedProjects(),
    getListedCategories(),
  ]);

  // Three of the pool lead the page, and which three turns over once per cache
  // window. Chosen here on the server rather than in the browser: picking after
  // hydration would visibly reorder the first row a visitor sees. Whichever are
  // not chosen fall into the catalog below, which already filters out the ones
  // on show, so nothing is hidden and nothing appears twice.
  const featured = rotateFeatured(featuredPool);

  return (
    <>
      <HomeExperience
        projects={projects}
        featured={featured}
        categories={categories}
        heroLogo={
          <HeroLogo
            tagline={settings?.tagline ?? "Designer. Builder. Storyteller."}
            statement={
              settings?.heroStatement ??
              "I design storytelling experiences that inspire hope and ignite purpose."
            }
          />
        }
      />
    </>
  );
}
