"use client";

/**
 * Floating actions — persistent email + newsletter buttons (bottom-right),
 * plus the newsletter modal they open.
 *
 * MIGRATION TEMPLATE NOTE:
 *   Port of vanilla floating-actions + newsletter-panel + setupNewsletter().
 *   Modal open/close is React state instead of classList toggling. The
 *   newsletter icon is the letter-with-heart we iterated on.
 *
 *   threads + contactEmail come from siteSettings (passed as props) so they're
 *   editable from Studio.
 */

import { useState, useEffect, useRef } from "react";
import type { NewsletterThread } from "@/lib/types";

interface FloatingActionsProps {
  contactEmail: string;
  newsletterTitle: string;
  newsletterSub: string;
  threads: NewsletterThread[];
}

export function FloatingActions({
  contactEmail,
  newsletterTitle,
  newsletterSub,
  threads,
}: FloatingActionsProps) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 200);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = inputRef.current?.value?.trim();
    if (!email) return;
    // TODO: wire to real subscription endpoint (ConvertKit / Beehiiv / etc.)
    setSuccess(true);
    setTimeout(() => {
      setOpen(false);
      setSuccess(false);
    }, 1800);
  }

  // Shared SVGs so the top-right header + bottom-right fabs stay identical.
  const emailIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6L12 13L21 6M3 6V18C3 18.5523 3.44772 19 4 19H20C20.5523 19 21 18.5523 21 18V6M3 6C3 5.44772 3.44772 5 4 5H20C20.5523 5 21 5.44772 21 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const newsletterIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 2H15L20 7V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V3C4 2.44772 4.44772 2 5 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M15 2V7H20" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 17.5C12 17.5 8 15.3 8 12.6C8 11.3 9 10.4 10.2 10.4C10.95 10.4 11.6 10.85 12 11.5C12.4 10.85 13.05 10.4 13.8 10.4C15 10.4 16 11.3 16 12.6C16 15.3 12 17.5 12 17.5Z" fill="currentColor" />
    </svg>
  );

  return (
    <>
      {/* Top-right header icons — same actions, persistent on every page */}
      <div className="top-actions" aria-label="Contact & subscribe">
        <a className="top-action" href={`mailto:${contactEmail}`} aria-label="Email Enrika" data-tooltip="Email me">
          {emailIcon}
        </a>
        <button className="top-action" aria-label="Open newsletter" data-tooltip="Newsletter" onClick={() => setOpen(true)}>
          {newsletterIcon}
        </button>
      </div>

      <div className="floating-actions" aria-label="Contact & subscribe">
        <a className="fab" href={`mailto:${contactEmail}`} aria-label="Email Enrika" data-tooltip="Email me">
          {emailIcon}
        </a>
        <button className="fab" aria-label="Open newsletter" data-tooltip="Newsletter" onClick={() => setOpen(true)}>
          {newsletterIcon}
        </button>
      </div>

      <div
        className={`newsletter-panel${open ? " is-open" : ""}`}
        aria-hidden={!open}
        onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      >
        <div className="newsletter-card" role="dialog" aria-labelledby="newsletter-title">
          <button className="newsletter-close" aria-label="Close newsletter" onClick={() => setOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <p className="newsletter-eyebrow">The Newsletter</p>
          <h2 className="newsletter-title" id="newsletter-title">{newsletterTitle}</h2>
          <p className="newsletter-sub">{newsletterSub}</p>
          <ul className="newsletter-threads">
            {threads.map((thread) => (
              <li key={thread.name}>
                <span className="thread-dot" style={{ background: thread.color }} />
                {thread.name}
              </li>
            ))}
          </ul>
          <form className={`newsletter-form${success ? " is-success" : ""}`} noValidate onSubmit={handleSubmit}>
            <input ref={inputRef} type="email" name="email" placeholder="your@email.com" required aria-label="Email address" />
            <button type="submit">Subscribe</button>
          </form>
          <p className="newsletter-note">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </>
  );
}
