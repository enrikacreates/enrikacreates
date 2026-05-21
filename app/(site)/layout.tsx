/**
 * Site layout — wraps all public pages (home, work, blog) with the persistent
 * footer + floating actions (email + newsletter).
 *
 * MIGRATION TEMPLATE NOTE:
 *   Route group `(site)` keeps this chrome off the /studio route (which lives
 *   outside the group with its own minimal layout). Site settings are fetched
 *   once here and passed to the footer + floating actions — single source.
 */

import { getSiteSettings } from "@/lib/sanity/fetch";
import { FloatingActions } from "@/components/FloatingActions";
import { SiteFooter } from "@/components/SiteFooter";

// Sensible fallbacks so the chrome renders even before siteSettings exists.
const DEFAULT_THREADS = [
  { name: "Fashion", color: "#FC7F5A" },
  { name: "Product", color: "#3498CE" },
  { name: "Community Building", color: "#F7B5B1" },
  { name: "Everyday Hope Stories", color: "#E8B84A" },
];

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <>
      {children}
      <SiteFooter settings={settings} />
      <FloatingActions
        contactEmail={settings?.contactEmail ?? "enrika@smallgorillamarketing.com"}
        newsletterTitle={settings?.newsletterTitle ?? "Enrika Creates"}
        newsletterSub={settings?.newsletterSub ?? "One letter. Four threads woven together."}
        threads={
          settings?.newsletterThreads && settings.newsletterThreads.length > 0
            ? settings.newsletterThreads
            : DEFAULT_THREADS
        }
      />
    </>
  );
}
