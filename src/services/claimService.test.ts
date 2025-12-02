import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  createClaim,
  getClaimsByItemId,
  getClaimByToken,
  updateClaim,
  deleteClaim,
} from './claimService';
import { createSignupSheet } from './signupSheetService';
import { createSignupItem } from './signupItemService';
import { supabase } from '../utils/supabaseClient';

// Clean up test data before each test
beforeEach(async () => {
  // Delete all test data (cascade will handle items and claims)
  await supabase
    .from('signup_sheets')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
});

// Arbitrary for generating claim data
const claimDataArbitrary = fc.record({
  guestName: fc.string({ minLength: 1, maxLength: 200 }),
  guestContact: fc.option(fc.string({ minLength: 1, maxLength: 200 }), {
    nil: undefined,
  }),
  itemDetails: fc.option(fc.string({ minLength: 1, maxLength: 500 }), {
    nil: undefined,
  }),
});

// Arbitrary for generating signup sheet data
const signupSheetDataArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 200 }),
  eventDate: fc
    .date({
      min: new Date('2020-01-01'),
      max: new Date('2030-12-31'),
    })
    .filter((d) => !isNaN(d.getTime())),
  description: fc.string({ maxLength: 1000 }),
  allowGuestAdditions: fc.boolean(),
});

// Arbitrary for generating signup item data
const signupItemDataArbitrary = fc.record({
  itemName: fc.string({ minLength: 1, maxLength: 200 }),
  quantityNeeded: fc.integer({ min: 1, max: 100 }),
  requireName: fc.boolean(),
  requireContact: fc.boolean(),
  requireItemDetails: fc.boolean(),
  displayOrder: fc.integer({ min: 0, max: 1000 }),
});

describe('Claim Service - Property Tests', () => {
  // Feature: signup-coordinator, Property 10: Claim data round-trip
  // Validates: Requirements 5.3
  it('Property 10: submitting and retrieving a claim returns the same field values', async () => {
    await fc.assert(
      fc.asyncProperty(
        signupSheetDataArbitrary,
        signupItemDataArbitrary,
        claimDataArbitrary,
        async (sheetData, itemData, claimData) => {
          // Create sheet and item
          const sheet = await createSignupSheet(sheetData);
          const item = await createSignupItem({
            sheetId: sheet.id,
            ...itemData,
          });

          // Create the claim
          const created = await createClaim({
            itemId: item.id,
            ...claimData,
          });

          // Retrieve by token
          const retrievedByToken = await getClaimByToken(created.claimToken);

          // Verify all fields match
          expect(retrievedByToken).not.toBeNull();
          expect(retrievedByToken!.guestName).toBe(claimData.guestName);
          expect(retrievedByToken!.guestContact).toBe(claimData.guestContact);
          expect(retrievedByToken!.itemDetails).toBe(claimData.itemDetails);
          expect(retrievedByToken!.itemId).toBe(item.id);
          expect(retrievedByToken!.claimToken).toBe(created.claimToken);

          // Also verify retrieval by item ID
          const claimsByItem = await getClaimsByItemId(item.id);
          const retrievedByItem = claimsByItem.find((c) => c.id === created.id);

          expect(retrievedByItem).toBeDefined();
          expect(retrievedByItem!.guestName).toBe(claimData.guestName);
          expect(retrievedByItem!.guestContact).toBe(claimData.guestContact);
          expect(retrievedByItem!.itemDetails).toBe(claimData.itemDetails);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  // Feature: signup-coordinator, Property 7: Claim submission decreases availability
  // Validates: Requirements 5.4
  it('Property 7: submitting a claim decreases available quantity by 1', async () => {
    await fc.assert(
      fc.asyncProperty(
        signupSheetDataArbitrary,
        signupItemDataArbitrary,
        claimDataArbitrary,
        async (sheetData, itemData, claimData) => {
          // Create sheet and item
          const sheet = await createSignupSheet(sheetData);
          const item = await createSignupItem({
            sheetId: sheet.id,
            ...itemData,
          });

          // Get initial claim count
          const initialClaims = await getClaimsByItemId(item.id);
          const initialCount = initialClaims.length;

          // Create a claim
          await createClaim({
            itemId: item.id,
            ...claimData,
          });

          // Get new claim count
          const newClaims = await getClaimsByItemId(item.id);
          const newCount = newClaims.length;

          // Verify count increased by 1
          expect(newCount).toBe(initialCount + 1);

          // Verify available quantity decreased by 1
          const initialAvailable = item.quantityNeeded - initialCount;
          const newAvailable = item.quantityNeeded - newCount;
          expect(newAvailable).toBe(initialAvailable - 1);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  // Feature: signup-coordinator, Property 16: Claim cancellation restores quantity
  // Validates: Requirements 9.4
  it('Property 16: canceling a claim increases available quantity by 1', async () => {
    await fc.assert(
      fc.asyncProperty(
        signupSheetDataArbitrary,
        signupItemDataArbitrary,
        claimDataArbitrary,
        async (sheetData, itemData, claimData) => {
          // Create sheet and item
          const sheet = await createSignupSheet(sheetData);
          const item = await createSignupItem({
            sheetId: sheet.id,
            ...itemData,
          });

          // Create a claim
          const claim = await createClaim({
            itemId: item.id,
            ...claimData,
          });

          // Get claim count before deletion
          const beforeClaims = await getClaimsByItemId(item.id);
          const beforeCount = beforeClaims.length;

          // Delete the claim
          await deleteClaim(claim.id);

          // Get claim count after deletion
          const afterClaims = await getClaimsByItemId(item.id);
          const afterCount = afterClaims.length;

          // Verify count decreased by 1
          expect(afterCount).toBe(beforeCount - 1);

          // Verify available quantity increased by 1
          const beforeAvailable = item.quantityNeeded - beforeCount;
          const afterAvailable = item.quantityNeeded - afterCount;
          expect(afterAvailable).toBe(beforeAvailable + 1);
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  // Feature: signup-coordinator, Property 17: Claim edit preserves quantity
  // Validates: Requirements 9.3
  it('Property 17: editing claim details does not change available quantity', async () => {
    await fc.assert(
      fc.asyncProperty(
        signupSheetDataArbitrary,
        signupItemDataArbitrary,
        claimDataArbitrary,
        claimDataArbitrary,
        async (sheetData, itemData, initialClaimData, updatedClaimData) => {
          // Create sheet and item
          const sheet = await createSignupSheet(sheetData);
          const item = await createSignupItem({
            sheetId: sheet.id,
            ...itemData,
          });

          // Create a claim
          const claim = await createClaim({
            itemId: item.id,
            ...initialClaimData,
          });

          // Get claim count before update
          const beforeClaims = await getClaimsByItemId(item.id);
          const beforeCount = beforeClaims.length;

          // Update the claim
          await updateClaim(claim.id, {
            guestName: updatedClaimData.guestName,
            guestContact: updatedClaimData.guestContact,
            itemDetails: updatedClaimData.itemDetails,
          });

          // Get claim count after update
          const afterClaims = await getClaimsByItemId(item.id);
          const afterCount = afterClaims.length;

          // Verify count is unchanged
          expect(afterCount).toBe(beforeCount);

          // Verify available quantity is unchanged
          const beforeAvailable = item.quantityNeeded - beforeCount;
          const afterAvailable = item.quantityNeeded - afterCount;
          expect(afterAvailable).toBe(beforeAvailable);
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);
});
