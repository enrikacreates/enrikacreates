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
};

export default nextConfig;
