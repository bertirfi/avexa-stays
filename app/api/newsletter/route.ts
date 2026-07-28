import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Newsletter opt-in → Brevo contact list (same Brevo account that sends the
 * refund notice — one email provider for everything).
 *
 * Trust boundary (api-validation rule): the body is Zod-validated before any
 * work. This endpoint takes an email and nothing that gates money or identity.
 *
 * Honesty: without BREVO_API_KEY + BREVO_LIST_ID the form must NOT pretend to
 * work — it returns 503 { not_configured } so the UI says "opening soon".
 * Robert flips this on by creating a list in Brevo (Contacts → Lists) and
 * adding its numeric id as BREVO_LIST_ID in Vercel.
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

  const key = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);
  if (!key || !Number.isInteger(listId) || listId <= 0) {
    // Warn once per server instance — the form is honest ("opening soon").
    if (!warnedNotConfigured) {
      console.warn(
        'newsletter: BREVO_API_KEY / BREVO_LIST_ID not set — subscriptions disabled',
      );
      warnedNotConfigured = true;
    }
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': key,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      // updateEnabled: an existing contact is updated (added to the list)
      // instead of erroring — resubscribing is a successful outcome.
      body: JSON.stringify({ email, listIds: [listId], updateEnabled: true }),
    });

    if (res.ok) {
      return NextResponse.json({ ok: true });
    }

    // Belt-and-braces: treat Brevo's duplicate error as already-subscribed.
    const bodyText = await res.text();
    if (res.status === 400 && bodyText.includes('duplicate_parameter')) {
      return NextResponse.json({ ok: true });
    }

    // Any other failure — log status + a body slice (domain only, no PII).
    console.error(
      `newsletter: Brevo error ${res.status} for ${emailDomain(email)} — ${bodyText.slice(0, 200)}`,
    );
    return NextResponse.json({ error: 'subscribe_failed' }, { status: 502 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown error';
    console.error(`newsletter: Brevo request failed for ${emailDomain(email)} — ${message}`);
    return NextResponse.json({ error: 'subscribe_failed' }, { status: 502 });
  }
}
