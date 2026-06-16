/**
 * Suites bookable together for multi-room ("Add room").
 *
 * Grouped per Robert 2026-06-16 by area (NOT strict building). Note: 201
 * (The Golden Forest, at Calea Victoriei 2) intentionally belongs to BOTH
 * Old City Center and Calea Victoriei.
 *   Old City Center : 101, 201
 *   Calea Victoriei : 202, 301, 302, 303, 201
 *   Universitate    : 203 (solo)
 *   Piața Romană    : 304 (solo)
 */
const ROOM_GROUPS: string[][] = [
  ['101', '201'],
  ['202', '301', '302', '303', '201'],
];

/** Other suite ids bookable alongside `propertyId` (union across its groups). */
export function getSiblingIds(propertyId: string): string[] {
  const siblings = new Set<string>();
  for (const group of ROOM_GROUPS) {
    if (group.includes(propertyId)) {
      for (const id of group) if (id !== propertyId) siblings.add(id);
    }
  }
  return [...siblings];
}
