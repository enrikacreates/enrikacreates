/**
 * POST /api/subscribe — a newsletter signup goes straight to Enrika's inbox.
 *
 * It used to write a `subscriber` document into Sanity, and that was a privacy
 * hole rather than a style choice: this project's datasets are public, Sanity
 * has no per-type permissions on a public dataset, and the project id sits in
 * the page source. Anyone could have read every subscriber's address with one
 * unauthenticated query. Nobody had subscribed yet, so nothing leaked, but the
 * form was live and the next signup would have been exposed.
 *
 * Email is the whole mechanism on purpose. A list of this size does not need a
 * database, and the one place a signup cannot be quietly missed is the inbox
 * it is already competing for attention in. Reply-To is the subscriber, so
 * answering someone is one keystroke.
 *
 * When Delivery is ready to own the list, set DELIVERY_URL and signups start
 * being stored there too. That is an env var, not a deploy: this route does
 * not need to change, and the notification keeps working whether or not the
 * forward succeeds.
 */

import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NOTIFY = "enrika@smallgorillacreative.com";
/** A verified Postmark sender signature. */
const FROM = "enrika@smallgorillacreative.com";

/** Delivery's brand slug for enrikagreathouse.com. */
const BRAND = "egr";

/**
 * Hand the address to Delivery as well, once it is ready to hold the list.
 *
 * Best effort by design: Delivery is still being built, and a signup must not
 * fail because the thing that will eventually store it is mid-deploy. The
 * email has already gone by this point, so nothing is lost either way.
 */
async function forwardToDelivery(email: string) {
  const base = process.env.DELIVERY_URL;
  if (!base) return;
  try {
    await fetch(`${base}/api/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, brand: BRAND, tags: ["enrikacreates"] }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.error("Delivery forward failed (the email still went):", err);
  }
}

export async function POST(request: Request) {
  let email: string | undefined;
  try {
    const body = await request.json();
    email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const token = process.env.POSTMARK_SERVER_TOKEN;
  if (!token) {
    /* Loud rather than silent. Without this the form would accept an address,
       say thank you, and drop it on the floor. */
    console.error("Subscribe: POSTMARK_SERVER_TOKEN is not set.");
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Postmark-Server-Token": token,
      },
      body: JSON.stringify({
        From: FROM,
        To: NOTIFY,
        ReplyTo: email,
        Subject: `New subscriber: ${email}`,
        TextBody: `${email} subscribed from enrikagreathouse.com.\n\nReply to this message to reach them.`,
        HtmlBody:
          `<p><strong>${email}</strong> subscribed from enrikagreathouse.com.</p>` +
          `<p style="color:#666">Reply to this message to reach them.</p>`,
        MessageStream: "outbound",
        Tag: "subscriber",
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Postmark rejected the notification:", res.status, detail);
      return NextResponse.json(
        { error: "Something went wrong. Try again." },
        { status: 502 }
      );
    }

    await forwardToDelivery(email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Subscribe failed:", err);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 502 }
    );
  }
}
