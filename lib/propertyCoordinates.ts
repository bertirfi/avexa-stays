import type { Property } from '@/types';

/**
 * Real building coordinates per suite, sourced from the Hostaway listing
 * payload (the PMS source of truth). Kept as a static lookup by property id —
 * coordinates are editorial constants, not live data, so they live here and are
 * overlaid in the data layer regardless of what the Supabase `content` cache
 * holds. Several suites share a building (Calea Victoriei 2 → 101/201;
 * Calea Victoriei 142-148 → 202/301/302/303); the map fans co-located pins out
 * so each stays individually clickable.
 */
export const PROPERTY_COORDINATES: Record<string, NonNullable<Property['coordinates']>> = {
  '101': { lat: 44.43032102, lng: 26.09698512 }, // Calea Victoriei 2 (Adriatica)
  '102': { lat: 44.44466396, lng: 26.09288435 }, // Calea Victoriei 142-148 — Bldg B, ap 34
  '201': { lat: 44.43035046, lng: 26.09692946 }, // Calea Victoriei 2 (Adriatica)
  '202': { lat: 44.44467593, lng: 26.09223928 }, // Calea Victoriei 142-148 — Bldg C
  '203': { lat: 44.43484180, lng: 26.10637440 }, // Strada Colței 25 (Universitate)
  '301': { lat: 44.44459838, lng: 26.09235428 }, // Calea Victoriei 142-148 — Bldg B
  '302': { lat: 44.44460987, lng: 26.09241530 }, // Calea Victoriei 142-148 — Bldg D
  '303': { lat: 44.44460963, lng: 26.09230533 }, // Calea Victoriei 142-148 — Bldg C
  '304': { lat: 44.45289746, lng: 26.10087197 }, // Strada Polonă 115 (Piața Romană)
};
