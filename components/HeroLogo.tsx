/**
 * Hero 1 — Logo + tagline (static, visible on load).
 *
 * MIGRATION TEMPLATE NOTE:
 *   Pure Server Component — no interactivity, all visual fidelity from CSS.
 *   The fadeUp animation runs via CSS keyframes, no JS needed.
 *
 *   `tagline` and `statement` come from siteSettings so editors can update
 *   them from Sanity Studio without redeploying.
 */

import Image from "next/image";

interface HeroLogoProps {
  tagline: string;
  statement: string;
}

export function HeroLogo({ tagline, statement }: HeroLogoProps) {
  return (
    <section className="hero-logo">
      <div className="hero-logo-inner">
        <h1 className="logomark is-svg" aria-label="Enrika">
          <Image
            src="/assets/enrikamark2.svg"
            alt="Enrika"
            width={500}
            height={120}
            priority
            draggable={false}
            unoptimized // SVG — pass through as-is
          />
        </h1>
        <p className="logo-subtitle">{tagline}</p>
        <p className="hero-statement">
          {statement.split("\n").map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </p>
      </div>

      {/* Scroll cue */}
      <div className="scroll-cue">
        <span />
        <p className="scroll-cue-text">Scroll to reveal</p>
      </div>
    </section>
  );
}
