import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRangeAvailability } from '@/lib/data/availability';
import { parseYmd, ymd } from '@/lib/date';

/**
 * Range availability for the /locations search results.
 * GET ?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD → { ok, data } where data maps
 * property_id → { available, totalRon?, nightlyRon?, alternative? }.
 *
 * Reads ONLY the Supabase availability cache (Hostaway rule: never live from
 * request paths). Backend failure returns 200 with {} data — the page must
 * degrade to "no availability filtering", not error.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_NIGHTS = 30; // aligned with lib/booking/quote.ts — a longer stay can't be booked
const MAX_DAYS_OUT = 380; // cache horizon

const QuerySchema = z
  .object({
    checkIn: z.string().regex(DATE_RE),
    checkOut: z.string().regex(DATE_RE),
  })
  .superRefine((q, ctx) => {
    const start = parseYmd(q.checkIn);
    const end = parseYmd(q.checkOut);
    // Round-trip check rejects impossible dates (e.g. 2026-02-31 rolls over).
    if (!start || !end || ymd(start) !== q.checkIn || ymd(end) !== q.checkOut) {
      ctx.addIssue({ code: 'custom', message: 'invalid date' });
      return;
    }
    const nights = Math.round((end.getTime() - start.getTime()) / 86_400_000);
    if (nights < 1) ctx.addIssue({ code: 'custom', message: 'checkOut must be after checkIn' });
    if (nights > MAX_NIGHTS) ctx.addIssue({ code: 'custom', message: 'stay too long' });
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + MAX_DAYS_OUT);
    if (start > horizon) ctx.addIssue({ code: 'custom', message: 'check-in too far out' });
  });

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    checkIn: url.searchParams.get('checkIn'),
    checkOut: url.searchParams.get('checkOut'),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  // Graceful failure inside: returns {} when Supabase is unreachable.
  const data = await getRangeAvailability(parsed.data.checkIn, parsed.data.checkOut);
  return NextResponse.json(
    { ok: true, data },
    { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } },
  );
}
