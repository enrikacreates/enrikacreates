/**
 * The skills chips, above the story rather than closing it.
 *
 * They used to sit at the end, which on betterstories put them 1314px down the
 * page: three paragraphs past the fold. For a hiring portfolio that is the
 * wrong way round, because the chips are the most scannable thing on the page
 * and the first thing a recruiter looks for.
 *
 * A fixed rail in the margin was the other candidate and is why this is a
 * component at all. Centred won: the margin only exists above a certain width
 * AND height, so a rail needed a second copy of the chips for narrow screens
 * plus guards to keep it clear of the case chevrons. Centred needs none of
 * that and reads the same at every size.
 */

export function ProjectSkills({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null;

  return (
    <section className="project-skills">
      <p className="project-skills-label">Skills</p>
      <ul className="project-skills-list">
        {skills.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </section>
  );
}
