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

import { useCallback } from "react";
import { HeroVideo } from "./HeroVideo";
import { WorkSection } from "./WorkSection";
import type { Category, ProjectListItem } from "@/lib/types";

interface HomeExperienceProps {
  projects: ProjectListItem[];
  featured: ProjectListItem[];
  categories: Category[];
}

export function HomeExperience({
  projects,
  featured,
  categories,
}: HomeExperienceProps) {
  // The catalog is always in the document, so this is purely a scroll jump.
  // /#work still works on arrival without any JS, for the same reason.
  const scrollToWork = useCallback(() => {
    document
      .getElementById("work")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <>
      <HeroVideo onViewWork={scrollToWork} />
      <WorkSection
        projects={projects}
        featured={featured}
        categories={categories}
      />
    </>
  );
}
