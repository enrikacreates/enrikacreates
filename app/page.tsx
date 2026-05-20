/**
 * Home page — Phase 1 placeholder.
 *
 * The full two-hero scroll experience (logo + GSAP collage) ports in Phase 3.
 * For now this shows a holding card so the preview deploy has something to render.
 */

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 540 }}>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.7rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(44, 37, 32, 0.55)",
            margin: 0,
          }}
        >
          In progress
        </p>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            margin: "0.75rem 0 1rem",
            letterSpacing: "-0.02em",
          }}
        >
          Enrika Creates
        </h1>

        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.6,
            color: "rgba(44, 37, 32, 0.7)",
            margin: 0,
          }}
        >
          Rebuilding on Next.js + Sanity. The live portfolio is still at{" "}
          <a href="https://enrikacreates.vercel.app">enrikacreates.vercel.app</a>
          .
        </p>

        <p style={{ marginTop: "2rem", fontSize: "0.85rem" }}>
          <a
            href="/studio"
            style={{
              display: "inline-block",
              padding: "0.7rem 1.25rem",
              borderRadius: 100,
              background: "var(--ink)",
              color: "var(--off-white)",
              textDecoration: "none",
              boxShadow: "0 6px 16px rgba(44, 37, 32, 0.18)",
            }}
          >
            Open Studio →
          </a>
        </p>
      </div>
    </main>
  );
}
