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

/** Single rate: rates[0].perNight (RON) = charged per-night price from the live base. */
function applyLivePricing(property: Property, priceFromRon: number | null): Property {
  if (!priceFromRon || priceFromRon <= 0 || property.rates.length === 0) return property;
  return {
    ...property,
    rates: [{ ...property.rates[0], perNight: accommodationRonPerNight(priceFromRon) }],
  };
}

/**
 * The rate CARD (name/perks/policy copy) and the cleaning fee are code-owned
 * editorial/config content — the static catalog always wins over the `content`
 * JSON cached in Supabase (which may still hold the old saver/flex dual rate
 * and predates `cleaningRon`). Only the live perNight survives from the row.
 */
function withCatalogRate(property: Property): Property {
  const source = staticProperties.find((p) => p.id === property.id);
  if (!source) return property;
  const perNight = property.rates[0]?.perNight ?? source.rates[0].perNight;
  return {
    ...property,
    rates: [{ ...source.rates[0], perNight }],
    cleaningRon: source.cleaningRon,
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

/**
 * Editorial copy (SERP title/description, the on-page description, and the
 * Good-to-know notes) is code-owned content, same as coordinates: the static
 * catalog always wins over the `content` JSON cached in Supabase, so rewrites
 * ship without re-seeding. The cached blob may also still hold the removed
 * `pitch` field — strip it so the stale key never leaks past this overlay.
 *
 * `building` rides along for the same reason: rows seeded before the field
 * existed carry no building id, which would silently drop the suite out of the
 * grouped /locations list. Forcing it from the catalog keeps grouping total.
 */
function withEditorialContent(property: Property): Property {
  const source = staticProperties.find((p) => p.id === property.id);
  if (!source) return property;
  const merged: Property = {
    ...property,
    building: source.building,
    description: source.description,
    goodToKnow: source.goodToKnow,
    metaDescription: source.metaDescription,
    metaTitle: source.metaTitle,
  };
  delete (merged as unknown as Record<string, unknown>).pitch;
  return merged;
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
      withCoordinates(withEditorialContent(withCatalogRate(applyLivePricing(row.content as unknown as Property, row.price_from_ron)))),
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
    return withCoordinates(withEditorialContent(withCatalogRate(applyLivePricing(data.content as unknown as Property, data.price_from_ron))));
  } catch {
    const fallback = staticProperties.find((p) => p.id === safe || p.slug === safe);
    return fallback ? withCoordinates(fallback) : null;
  }
}

/** generateStaticParams source — static (no network) so the build always has paths. */
export function getAllPropertySlugIds(): Array<{ id: string; slug: string }> {
  return staticProperties.map((p) => ({ id: p.id, slug: p.slug }));
}
