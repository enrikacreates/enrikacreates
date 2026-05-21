"use client";

/**
 * Home experience — coordinates the collage hero + the work catalog on a
 * single page (vanilla single-page model).
 *
 * MIGRATION TEMPLATE NOTE:
 *   "View Work" reveals the catalog (display:none → block) and smooth-scrolls
 *   to it. Arriving with #work in the URL (e.g. "Back to work" from a detail
 *   page) auto-reveals + scrolls on mount. Scrolling back up returns to the
 *   collage animation — no separate route, no missing navigation.
 */

import { useState, useEffect, useCallback } from "react";
import { HeroCollage } from "./HeroCollage";
import { WorkSection } from "./WorkSection";
import type { ProjectListItem } from "@/lib/types";

interface HomeExperienceProps {
  projects: ProjectListItem[];
  featured: ProjectListItem[];
}

export function HomeExperience({ projects, featured }: HomeExperienceProps) {
  const [revealed, setRevealed] = useState(false);

  const revealWork = useCallback((smooth = true) => {
    setRevealed(true);
    // Wait for the section to render (display:none → block) before scrolling.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document
          .getElementById("work")
          ?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
      });
    });
  }, []);

  // Deep-link: /#work (e.g. "Back to work" from a detail page) reveals + jumps.
  useEffect(() => {
    if (window.location.hash === "#work") revealWork(false);
  }, [revealWork]);

  return (
    <>
      <HeroCollage onViewWork={() => revealWork(true)} />
      <WorkSection projects={projects} featured={featured} revealed={revealed} />
    </>
  );
}
