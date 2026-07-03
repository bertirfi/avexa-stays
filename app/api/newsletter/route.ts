import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Newsletter opt-in → Resend Audience contact (the client's existing Resend
 * account — the same one already sending the refund notice).
 *
 * Trust boundary (api-validation rule): the body is Zod-validated before any
 * work. This endpoint takes an email and nothing that gates money or identity.
 *
 * Honesty: without RESEND_API_KEY + RESEND_AUDIENCE_ID the form must NOT
 * pretend to work — it returns 503 { not_configured } so the UI says "opening
 * soon". Robert flips this on by creating an Audience in the Resend dashboard
 * (Audiences → Create) and adding its id as RESEND_AUDIENCE_ID in Vercel.
 */

export const runtime = 'nodejs';

const BodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  // Honeypot: real users never fill a hidden, off-screen, tab-skipped field.
  // Accept ANY string — a non-empty value must reach the silent-drop branch
  // below (rejecting it with a 400 would tell the bot it was detected).
  website: z.string().max(500).optional(),
});

/** Log only the email domain — never the local part (no PII in logs). */
function emailDomain(email: string): string {
  const at = email.lastIndexOf('@');
  return at >= 0 ? email.slice(at) : '(no domain)';
}

let warnedNotConfigured = false;

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const { email, website } = parsed.data;

  // Silent bot drop: honeypot tripped → look successful, do nothing.
  if (website) {
    return NextResponse.json({ ok: true });
  }

  // Resend Audiences — the client already has the Resend account (it also
  // sends the refund notice); no second marketing subscription needed.
  const key = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!key || !audienceId) {
    // Warn once per server instance — the form is honest ("opening soon").
    if (!warnedNotConfigured) {
      console.warn(
        'newsletter: RESEND_API_KEY / RESEND_AUDIENCE_ID not set — subscriptions disabled',
      );
      warnedNotConfigured = true;
    }
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  try {
    const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    });

    if (res.ok) {
      return NextResponse.json({ ok: true });
    }

    // An already-registered contact is a successful outcome (already subscribed).
    const bodyText = await res.text();
    if (res.status === 409 || bodyText.toLowerCase().includes('already exist')) {
      return NextResponse.json({ ok: true });
    }

    // Any other failure — log status + a body slice (domain only, no PII).
    console.error(
      `newsletter: Resend error ${res.status} for ${emailDomain(email)} — ${bodyText.slice(0, 200)}`,
    );
    return NextResponse.json({ error: 'subscribe_failed' }, { status: 502 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown error';
    console.error(`newsletter: Resend request failed for ${emailDomain(email)} — ${message}`);
    return NextResponse.json({ error: 'subscribe_failed' }, { status: 502 });
  }
}
