/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sanity image CDN
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  // Enable styled-components compiler (still using it sparingly; CSS modules + global do most of the work)
  compiler: {
    styledComponents: true,
  },
  // Clean URL for the internal app-plan reference page (static file in /public).
  async rewrites() {
    return [
      { source: "/appplan", destination: "/appplan.html" },
      // Long-form case studies: hand-built HTML decks in /public/case, served
      // at a clean URL. Same pattern as /appplan above.
      { source: "/case/:slug", destination: "/case/:slug.html" },
    ];
  },
  // Single-page model: the catalog lives on the home page now. Old /work
  // links land on home (the #work hash reveals + scrolls client-side).
  async redirects() {
    return [
      { source: "/work", destination: "/#work", permanent: false },
    ];
  },
};

export default nextConfig;
