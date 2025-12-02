import type { SignupItem, Claim } from '../types';

/**
 * Calculates the available quantity for a signup item
 * Formula: available = quantityNeeded - claimCount
 *
 * @param item - The signup item
 * @param claims - Array of claims for this item
 * @returns The number of available slots (minimum 0)
 */
export function calculateAvailableQuantity(
  item: SignupItem,
  claims: Claim[]
): number {
  // Handle null/undefined checks
  if (!item || typeof item.quantityNeeded !== 'number') {
    return 0;
  }

  if (!claims || !Array.isArray(claims)) {
    return Math.max(0, item.quantityNeeded);
  }

  const claimCount = claims.length;
  const available = item.quantityNeeded - claimCount;

  // Ensure we never return negative values
  return Math.max(0, available);
}

/**
 * Checks if a signup item is full (no more claims can be accepted)
 *
 * @param item - The signup item
 * @param claims - Array of claims for this item
 * @returns true if the item is full, false otherwise
 */
export function isItemFull(item: SignupItem, claims: Claim[]): boolean {
  const available = calculateAvailableQuantity(item, claims);
  return available === 0;
}
