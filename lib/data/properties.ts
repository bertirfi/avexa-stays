import { properties as staticProperties } from '@/lib/properties';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { accommodationRonPerNight } from '@/lib/pricing';
import { PROPERTY_COORDINATES } from '@/lib/propertyCoordinates';
import type { Property } from '@/types';

/**
 * Server-side property data access. Reads the curated editorial content +
 * live `price_from_ron` from Supabase, deriving the charged RON price via the
 * pricing pipeline (RON is the money of record; display converts later).
 * Falls back to the bundled static catalog whenever Supabase is unreachable
 * (offline builds, outages) so rendering never fails — prices then revert to
 * the static RON rates until the next live render.
 */

/** Rebuild rates[].perNight (RON) from the live base price; rates[0] = charged RON. */
function applyLivePricing(property: Property, priceFromRon: number | null): Property {
  const base = property.rates[0]?.perNight;
  if (!priceFromRon || priceFromRon <= 0 || !base || base <= 0) return property;

  // Flex (rates[1]) has no independent Hostaway price — it inherits the
  // flex/saver ratio baked into the static catalog.
  const effective = accommodationRonPerNight(priceFromRon);
  const factor = effective / base;
  return {
    ...property,
    rates: property.rates.map((rate, i) => ({
      ...rate,
      perNight:
        i === 0 ? effective : Math.max(effective, Math.round(rate.perNight * factor)),
    })),
  };
}

/**
 * Overlay real building coordinates (static, by id) onto a property. Coordinates
 * are editorial constants, so this guarantees markers work on both the live
 * Supabase path and the static fallback — regardless of what the cached
 * `content` JSON holds.
 */
function withCoordinates(property: Property): Property {
  if (property.coordinates) return property;
  const coordinates = PROPERTY_COORDINATES[property.id];
  return coordinates ? { ...property, coordinates } : property;
}

export async function getAllPropertiesData(): Promise<Property[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('properties')
      .select('id, content, price_from_ron')
      .eq('active', true)
      .order('id');
    if (error || !data || data.length === 0) {
      throw new Error(error?.message ?? 'no property rows');
    }
    return data.map((row) =>
      withCoordinates(applyLivePricing(row.content as unknown as Property, row.price_from_ron)),
    );
  } catch {
    return staticProperties.map(withCoordinates);
  }
}

export async function getPropertyData(idOrSlug: string): Promise<Property | null> {
  const safe = idOrSlug.replace(/[^a-z0-9-]/gi, '');
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('properties')
      .select('content, price_from_ron')
      .or(`id.eq.${safe},slug.eq.${safe}`)
      .maybeSingle();
    if (error || !data) throw new Error(error?.message ?? 'not found');
    return withCoordinates(applyLivePricing(data.content as unknown as Property, data.price_from_ron));
  } catch {
    const fallback = staticProperties.find((p) => p.id === safe || p.slug === safe);
    return fallback ? withCoordinates(fallback) : null;
  }
}

/** generateStaticParams source — static (no network) so the build always has paths. */
export function getAllPropertySlugIds(): Array<{ id: string; slug: string }> {
  return staticProperties.map((p) => ({ id: p.id, slug: p.slug }));
}
