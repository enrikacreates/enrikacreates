/**
 * Site footer — mark, social links, copyright.
 *
 * MIGRATION TEMPLATE NOTE:
 *   Server Component. Social links + footer copy come from siteSettings.
 *   {year} placeholder in footerCopy is replaced with the current year.
 */

import type { SiteSettings } from "@/lib/types";

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  pinterest: "Pinterest",
  linkedin: "LinkedIn",
  email: "Email",
  other: "Link",
};

export function SiteFooter({ settings }: { settings: SiteSettings | null }) {
  const year = new Date().getFullYear();
  const copy = (settings?.footerCopy ?? "© {year} Enrika Greathouse").replace(
    "{year}",
    String(year)
  );
  const links = settings?.socialLinks ?? [];

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-mark">{settings?.siteName ?? "Enrika Creates"}</p>
        <div className="footer-links">
          {links.length > 0 ? (
            links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target={link.platform === "email" ? undefined : "_blank"}
                rel="noopener"
              >
                {link.label || PLATFORM_LABELS[link.platform] || "Link"}
              </a>
            ))
          ) : (
            <>
              <a href="https://instagram.com" target="_blank" rel="noopener">Instagram</a>
              <a href="https://pinterest.com" target="_blank" rel="noopener">Pinterest</a>
              <a href={`mailto:${settings?.contactEmail ?? "enrika@smallgorillamarketing.com"}`}>Email</a>
            </>
          )}
        </div>
        <p className="footer-copy">{copy}</p>
      </div>
    </footer>
  );
}
