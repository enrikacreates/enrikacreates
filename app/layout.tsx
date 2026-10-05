import { SITE_URL } from "@/lib/siteUrl";
import type { Metadata } from "next";
import "./globals.css";

/**
 * Root layout — wraps every page.
 *
 * MIGRATION TEMPLATE NOTE:
 *   - Fonts and brand-wide metadata live here.
 *   - The Studio route at /studio uses its own layout (see app/studio/.../layout.tsx)
 *     to bypass site chrome.
 */

/**
 * The site's own address, now that enrikagreathouse.com is live and
 * www 308s to it.
 *
 * metadataBase is what every relative URL in the metadata resolves against:
 * canonicals, Open Graph images, share previews. It was still the .vercel.app
 * deployment URL, which meant a shared link advertised the deployment rather
 * than the domain, and search engines were given the wrong address as the
 * reference. The deployment URL still works and still serves; it just no
 * longer claims to be the site.
 */
export const metadata: Metadata = {
  title: "Enrika Creates",
  description:
    "I design storytelling experiences that inspire hope and ignite purpose.",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Enrika Creates",
    title: "Enrika Creates",
    description:
      "I design storytelling experiences that inspire hope and ignite purpose.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
