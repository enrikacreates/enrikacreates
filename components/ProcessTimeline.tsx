/**
 * Research and process timeline on a project page.
 *
 * Sits below Challenge / Action / Result. Those three are the summary; this is
 * the depth underneath it, and the order matters: a reader gets the shape of
 * the work in three paragraphs, then decides whether to read how it was
 * arrived at.
 *
 * Each step renders up to three prose blocks, and only the ones that exist. The
 * labels are fixed rather than editable because their consistency is the point:
 * once a reader has read "What changed" on the first step, they can scan
 * straight to it on the rest, which is the line that actually shows judgement.
 *
 * Server component: nothing here is interactive.
 */

import { urlFor } from "@/lib/sanity/image";
import type { ProcessStep, ProcessKind } from "@/lib/types";

const KIND_LABEL: Record<ProcessKind, string> = {
  research: "Research",
  insight: "Insight",
  decision: "Decision",
  iteration: "Iteration",
  validation: "Validation",
};

/** Label / value pairs, in the order they read. */
const BLOCKS = [
  { key: "researched", label: "What I did" },
  { key: "learned", label: "What it told me" },
  { key: "changed", label: "What changed" },
] as const;

export function ProcessTimeline({ steps }: { steps: ProcessStep[] }) {
  if (steps.length === 0) return null;

  return (
    <section className="project-process">
      <h2 className="project-section-title">Research &amp; process</h2>

      <ol className="process-list">
        {steps.map((step, i) => (
          <li className="process-step" key={`${step.title}-${i}`}>
            <div className="process-step-head">
              <span className="process-kind">
                {KIND_LABEL[step.kind] ?? step.kind}
              </span>
              <h3 className="process-title">{step.title}</h3>
            </div>

            <div className="process-body">
              {BLOCKS.map(({ key, label }) =>
                step[key] ? (
                  <div className="process-block" key={key}>
                    <p className="process-label">{label}</p>
                    <p>{step[key]}</p>
                  </div>
                ) : null
              )}
            </div>

            {step.image?.asset && (
              <figure className="process-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={urlFor(step.image).width(1400).auto("format").url()}
                  alt={step.alt ?? ""}
                  loading="lazy"
                  draggable={false}
                />
                {step.caption && <figcaption>{step.caption}</figcaption>}
              </figure>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
