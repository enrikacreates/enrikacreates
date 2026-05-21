/**
 * POST /api/subscribe — capture a newsletter signup into Sanity.
 *
 * MIGRATION TEMPLATE NOTE:
 *   Runs server-side so it can use the write token safely. Idempotent: the
 *   subscriber _id is derived from the email, so re-subscribing the same
 *   address updates rather than duplicates. Basic email validation only —
 *   add a honeypot / rate limit later if spam becomes an issue.
 */

import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/writeClient";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email: string | undefined;
  try {
    const body = await request.json();
    email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  // Deterministic id → idempotent (no duplicate docs for the same email).
  const safeId = `subscriber.${email.replace(/[^a-z0-9]/g, "-")}`;

  try {
    await writeClient.createIfNotExists({
      _id: safeId,
      _type: "subscriber",
      email,
      subscribedAt: new Date().toISOString(),
      source: "newsletter modal",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Subscribe failed:", err);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
