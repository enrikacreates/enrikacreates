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
    ];
  },
};

export default nextConfig;
