import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { createSignupSheet } from '../services/signupSheetService';
import { createSignupItem } from '../services/signupItemService';
import { createClaim, getClaimByToken } from '../services/claimService';
import { supabase } from '../utils/supabaseClient';
import { generateToken } from '../utils/tokenGenerator';

// Clean up test data before each test
beforeEach(async () => {
  // Delete all test data explicitly in reverse order of dependencies
  await supabase
    .from('claims')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  await supabase
    .from('signup_items')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  await supabase
    .from('signup_sheets')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  // Add a small delay to ensure cleanup completes
  await new Promise((resolve) => setTimeout(resolve, 100));
});

// Arbitrary for generating claim data
const claimDataArbitrary = fc.record({
  guestName: fc.string({ minLength: 1, maxLength: 100 }),
  guestContact: fc.option(fc.string({ minLength: 1, maxLength: 100 }), {
    nil: undefined,
  }),
  itemDetails: fc.option(fc.string({ minLength: 1, maxLength: 500 }), {
    nil: undefined,
  }),
});

describe('EditClaimPage - Property Tests', () => {
  // Feature: signup-coordinator, Property 15: Claim token grants claim edit access
  // Validates: Requirements 9.2
  it('Property 15: valid claim token grants access, invalid token denies access', async () => {
    await fc.assert(
      fc.asyncProperty(claimDataArbitrary, async (claimData) => {
        // Create a signup sheet
        const sheet = await createSignupSheet({
          title: 'Test Event',
          eventDate: new Date('2025-12-31'),
          description: 'Test Description',
          allowGuestAdditions: false,
        });

        // Create a signup item
        const item = await createSignupItem({
          sheetId: sheet.id,
          itemName: 'Test Item',
          quantityNeeded: 5,
          requireName: true,
          requireContact: !!claimData.guestContact,
          requireItemDetails: !!claimData.itemDetails,
          displayOrder: 0,
        });

        // Create a claim
        const created = await createClaim({
          itemId: item.id,
          guestName: claimData.guestName,
          guestContact: claimData.guestContact,
          itemDetails: claimData.itemDetails,
        });

        // Add a small delay to ensure database consistency
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Retrieve with valid claim token
        const retrieved = await getClaimByToken(created.claimToken);
        expect(retrieved).not.toBeNull();
        if (!retrieved) {
          throw new Error(
            `Failed to retrieve claim with token ${created.claimToken}`
          );
        }

        // Verify that the correct claim token matches
        expect(retrieved.claimToken).toBe(created.claimToken);
        expect(retrieved.id).toBe(created.id);

        // Generate an invalid token (different from the actual claim token)
        let invalidToken = generateToken();
        // Ensure it's actually different
        while (invalidToken === created.claimToken) {
          invalidToken = generateToken();
        }

        // Verify that an invalid token does not retrieve the claim
        const retrievedWithInvalidToken = await getClaimByToken(invalidToken);
        expect(retrievedWithInvalidToken).toBeNull();

        // The property: only the correct claim token should grant access
        const shouldGrantAccess = async (token: string) => {
          const claim = await getClaimByToken(token);
          return claim !== null && claim.id === created.id;
        };

        expect(await shouldGrantAccess(created.claimToken)).toBe(true);
        expect(await shouldGrantAccess(invalidToken)).toBe(false);
      }),
      { numRuns: 10 }
    );
  }, 240000);
});

describe('EditClaimPage - Update and Cancel Functionality', () => {
  it('should update claim details successfully', async () => {
    // Create a signup sheet
    const sheet = await createSignupSheet({
      title: 'Test Event',
      eventDate: new Date('2025-12-31'),
      description: 'Test Description',
      allowGuestAdditions: false,
    });

    // Create a signup item
    const item = await createSignupItem({
      sheetId: sheet.id,
      itemName: 'Test Item',
      quantityNeeded: 5,
      requireName: true,
      requireContact: true,
      requireItemDetails: true,
      displayOrder: 0,
    });

    // Create a claim
    const claim = await createClaim({
      itemId: item.id,
      guestName: 'Original Name',
      guestContact: 'original@example.com',
      itemDetails: 'Original details',
    });

    // Retrieve the claim by token
    const retrieved = await getClaimByToken(claim.claimToken);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.guestName).toBe('Original Name');

    // Update the claim (simulating what the page does)
    const { updateClaim } = await import('../services/claimService');
    await updateClaim(claim.id, {
      guestName: 'Updated Name',
      guestContact: 'updated@example.com',
      itemDetails: 'Updated details',
    });

    // Retrieve again to verify update
    const updated = await getClaimByToken(claim.claimToken);
    expect(updated).not.toBeNull();
    expect(updated!.guestName).toBe('Updated Name');
    expect(updated!.guestContact).toBe('updated@example.com');
    expect(updated!.itemDetails).toBe('Updated details');
  }, 60000);

  it('should cancel claim and restore quantity', async () => {
    // Create a signup sheet
    const sheet = await createSignupSheet({
      title: 'Test Event',
      eventDate: new Date('2025-12-31'),
      description: 'Test Description',
      allowGuestAdditions: false,
    });

    // Create a signup item with quantity 3
    const item = await createSignupItem({
      sheetId: sheet.id,
      itemName: 'Test Item',
      quantityNeeded: 3,
      requireName: true,
      requireContact: false,
      requireItemDetails: false,
      displayOrder: 0,
    });

    // Create a claim
    const claim = await createClaim({
      itemId: item.id,
      guestName: 'Test User',
    });

    // Get claims count before cancellation
    const { getClaimsByItemId } = await import('../services/claimService');
    const claimsBefore = await getClaimsByItemId(item.id);
    expect(claimsBefore.length).toBe(1);

    // Cancel the claim (simulating what the page does)
    const { deleteClaim } = await import('../services/claimService');
    await deleteClaim(claim.id);

    // Verify claim is deleted
    const claimsAfter = await getClaimsByItemId(item.id);
    expect(claimsAfter.length).toBe(0);

    // Verify the claim cannot be retrieved by token anymore
    const retrieved = await getClaimByToken(claim.claimToken);
    expect(retrieved).toBeNull();
  }, 60000);
});
