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

export const metadata: Metadata = {
  title: "Enrika Creates",
  description:
    "I design storytelling experiences that inspire hope and ignite purpose.",
  metadataBase: new URL("https://enrikacreates.vercel.app"),
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
