import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateAvailableQuantity,
  isItemFull,
} from './availabilityCalculator';
import type { SignupItem, Claim } from '../types';

// Arbitrary for generating signup items
const signupItemArbitrary = fc.record({
  id: fc.uuid(),
  sheetId: fc.uuid(),
  itemName: fc.string({ minLength: 1, maxLength: 200 }),
  quantityNeeded: fc.integer({ min: 1, max: 100 }),
  requireName: fc.boolean(),
  requireContact: fc.boolean(),
  requireItemDetails: fc.boolean(),
  displayOrder: fc.integer({ min: 0, max: 1000 }),
  createdAt: fc.date({
    min: new Date('2020-01-01'),
    max: new Date('2030-12-31'),
  }),
});

// Arbitrary for generating claims
const claimArbitrary = fc.record({
  id: fc.uuid(),
  itemId: fc.uuid(),
  guestName: fc.string({ minLength: 1, maxLength: 200 }),
  guestContact: fc.option(fc.string({ minLength: 1, maxLength: 200 }), {
    nil: undefined,
  }),
  itemDetails: fc.option(fc.string({ minLength: 1, maxLength: 500 }), {
    nil: undefined,
  }),
  claimToken: fc.string({ minLength: 32, maxLength: 64 }),
  createdAt: fc.date({
    min: new Date('2020-01-01'),
    max: new Date('2030-12-31'),
  }),
  updatedAt: fc.date({
    min: new Date('2020-01-01'),
    max: new Date('2030-12-31'),
  }),
});

describe('Availability Calculator - Property Tests', () => {
  // Feature: signup-coordinator, Property 6: Available quantity calculation
  // Validates: Requirements 4.3, 5.4
  it('Property 6: available quantity equals quantityNeeded minus claim count', () => {
    fc.assert(
      fc.property(
        signupItemArbitrary,
        fc.array(claimArbitrary, { maxLength: 150 }),
        (item: SignupItem, claims: Claim[]) => {
          const available = calculateAvailableQuantity(item, claims);
          const expected = Math.max(0, item.quantityNeeded - claims.length);

          expect(available).toBe(expected);
          expect(available).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('handles null/undefined item gracefully', () => {
    const claims: Claim[] = [];

    // @ts-expect-error Testing null handling
    expect(calculateAvailableQuantity(null, claims)).toBe(0);

    // @ts-expect-error Testing undefined handling
    expect(calculateAvailableQuantity(undefined, claims)).toBe(0);
  });

  it('handles null/undefined claims gracefully', () => {
    fc.assert(
      fc.property(signupItemArbitrary, (item: SignupItem) => {
        // @ts-expect-error Testing null handling
        const availableNull = calculateAvailableQuantity(item, null);
        expect(availableNull).toBe(Math.max(0, item.quantityNeeded));

        // @ts-expect-error Testing undefined handling
        const availableUndefined = calculateAvailableQuantity(item, undefined);
        expect(availableUndefined).toBe(Math.max(0, item.quantityNeeded));
      }),
      { numRuns: 100 }
    );
  });

  it('never returns negative values', () => {
    fc.assert(
      fc.property(
        signupItemArbitrary,
        fc.array(claimArbitrary, { minLength: 0, maxLength: 200 }),
        (item: SignupItem, claims: Claim[]) => {
          const available = calculateAvailableQuantity(item, claims);
          expect(available).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Item Full Check - Property Tests', () => {
  // Feature: signup-coordinator, Property 8: Full items reject new claims
  // Validates: Requirements 5.5
  it('Property 8: item is full when available quantity is zero', () => {
    fc.assert(
      fc.property(
        signupItemArbitrary,
        fc.array(claimArbitrary, { maxLength: 150 }),
        (item: SignupItem, claims: Claim[]) => {
          const available = calculateAvailableQuantity(item, claims);
          const isFull = isItemFull(item, claims);

          // Item should be full if and only if available is 0
          expect(isFull).toBe(available === 0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('item is full when claims equal or exceed quantity needed', () => {
    fc.assert(
      fc.property(signupItemArbitrary, (item: SignupItem) => {
        // Create exactly quantityNeeded claims
        const exactClaims: Claim[] = Array.from(
          { length: item.quantityNeeded },
          (_, i) => ({
            id: `claim-${i}`,
            itemId: item.id,
            guestName: `Guest ${i}`,
            claimToken: `token-${i}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        );

        expect(isItemFull(item, exactClaims)).toBe(true);
        expect(calculateAvailableQuantity(item, exactClaims)).toBe(0);

        // Create more than quantityNeeded claims
        const excessClaims: Claim[] = Array.from(
          { length: item.quantityNeeded + 5 },
          (_, i) => ({
            id: `claim-${i}`,
            itemId: item.id,
            guestName: `Guest ${i}`,
            claimToken: `token-${i}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        );

        expect(isItemFull(item, excessClaims)).toBe(true);
        expect(calculateAvailableQuantity(item, excessClaims)).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it('item is not full when claims are less than quantity needed', () => {
    fc.assert(
      fc.property(signupItemArbitrary, (item: SignupItem) => {
        // Create fewer claims than quantityNeeded (at least 1 less)
        const claimCount = Math.max(0, item.quantityNeeded - 1);
        const claims: Claim[] = Array.from({ length: claimCount }, (_, i) => ({
          id: `claim-${i}`,
          itemId: item.id,
          guestName: `Guest ${i}`,
          claimToken: `token-${i}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        expect(isItemFull(item, claims)).toBe(false);
        expect(calculateAvailableQuantity(item, claims)).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });
});
