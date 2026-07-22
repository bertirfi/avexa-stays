import { NextResponse } from 'next/server';
import { properties } from '@/lib/properties';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { HOSTAWAY_LISTING_BY_PROPERTY } from '@/lib/hostaway/mapping';
import { timingSafeEqualStrings } from '@/lib/timing-safe';
import type { Json } from '@/types/database.types';

export const dynamic = 'force-dynamic';

/**
 * One-time / idempotent seed: pushes the 8 curated AVEXA properties from
 * lib/properties.ts into Supabase, including the full editorial content (as
 * JSONB) and the Hostaway listing id. Re-runnable — upserts by id.
 *
 * Bearer SYNC_SECRET. Run:
 *   $h=@{Authorization="Bearer <SYNC_SECRET>"}
 *   Invoke-RestMethod -Method Post http://localhost:3000/api/admin/seed -Headers $h
 */
export async function POST(request: Request) {
  const secret = process.env.SYNC_SECRET;
  const auth = request.headers.get('authorization') ?? '';
  if (!secret || !timingSafeEqualStrings(auth, `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const rows = properties.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle,
    neighborhood: p.neighborhood,
    description: p.description,
    content: p as unknown as Json,
    images: p.photos as unknown as Json,
    max_guests: p.maxGuests,
    hostaway_listing_id: HOSTAWAY_LISTING_BY_PROPERTY[p.id]
      ? String(HOSTAWAY_LISTING_BY_PROPERTY[p.id])
      : null,
    active: true,
  }));

  const { error } = await getSupabaseAdmin()
    .from('properties')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    ok: true,
    seeded: rows.length,
    mapping: rows.map((r) => ({ id: r.id, hostaway: r.hostaway_listing_id })),
  });
}
