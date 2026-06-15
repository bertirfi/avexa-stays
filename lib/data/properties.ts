import { properties as staticProperties } from '@/lib/properties';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { effectiveEurPerNight } from '@/lib/pricing';
import type { Property } from '@/types';

/**
 * Server-side property data access. Reads the curated editorial content +
 * live `price_from_ron` from Supabase, converting the price to EUR via the
 * pricing pipeline. Falls back to the bundled static catalog whenever Supabase
 * is unreachable (offline builds, outages) so rendering never fails — prices
 * then revert to the original hardcoded rates until the next live render.
 */

/** Rebuild rates[].perNight from the live RON price; rates[0] = effective EUR. */
function applyLivePricing(property: Property, priceFromRon: number | null): Property {
  const base = property.rates[0]?.perNight;
  if (!priceFromRon || priceFromRon <= 0 || !base || base <= 0) return property;

  const effective = effectiveEurPerNight(priceFromRon);
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
      applyLivePricing(row.content as unknown as Property, row.price_from_ron),
    );
  } catch {
    return staticProperties;
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
    return applyLivePricing(data.content as unknown as Property, data.price_from_ron);
  } catch {
    return staticProperties.find((p) => p.id === safe || p.slug === safe) ?? null;
  }
}

/** generateStaticParams source — static (no network) so the build always has paths. */
export function getAllPropertySlugIds(): Array<{ id: string; slug: string }> {
  return staticProperties.map((p) => ({ id: p.id, slug: p.slug }));
}
