/**
 * AVEXA property id -> Hostaway listing id.
 *
 * Confirmed 2026-06-16 against the owner's Drive folder names (building/apartment
 * codes: D2, C5, C7, B35 ...) cross-checked with Hostaway "internal listing
 * name". Names differ across systems; the building/apartment code is the anchor.
 *
 * Note: a 9th unit — Suite 102 (CV142-B34) — is under renovation and not listed
 * on the site, so it is intentionally absent here.
 */
export const HOSTAWAY_LISTING_BY_PROPERTY: Record<string, number> = {
  '101': 473889, // The Little Gem            — CV 2, ap 2b (studio, 2g)
  '201': 473898, // The Golden Forest         — CV 2, ap 2a
  '202': 473904, // The Modern Green Gem       — CV 142, Building C, ap 5
  '203': 502511, // The Modern Quartz Gem      — Colței 25
  '301': 473896, // The Ultracentral Gem & Palace View — CV 142, Building B, ap 35
  '302': 473895, // The Modern Sapphire Gem    — CV 142, Building D, ap 2
  '303': 499679, // The Modern Oak Gem         — CV 142, Building C, ap 7
  '304': 473905, // Central Quiet Luxury       — Polonă 115
};
