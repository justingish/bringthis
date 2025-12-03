import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { createSignupItem, getSignupItemsBySheetId } from './signupItemService';
import { createSignupSheet } from './signupSheetService';
import { supabase } from '../utils/supabaseClient';

// Clean up test data before each test
beforeEach(async () => {
  // Delete all test data (cascade will handle items and claims)
  await supabase
    .from('signup_sheets')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
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

// Arbitrary for generating signup sheet data (needed for creating items)
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

describe('SignupItem Service - Property Tests', () => {
  // Feature: signup-coordinator, Property 3: Signup items persist with configuration
  // Validates: Requirements 2.1, 2.2, 2.3
  it('Property 3: adding a signup item persists all configuration', async () => {
    await fc.assert(
      fc.asyncProperty(
        signupSheetDataArbitrary,
        signupItemDataArbitrary,
        async (sheetData, itemData) => {
          // Create a sheet first
          const sheet = await createSignupSheet(sheetData);

          // Create the item
          const created = await createSignupItem({
            sheetId: sheet.id,
            ...itemData,
          });

          // Retrieve items for the sheet
          const items = await getSignupItemsBySheetId(sheet.id);

          // Find our item
          const retrieved = items.find((item) => item.id === created.id);

          // Verify all fields match
          expect(retrieved).toBeDefined();
          expect(retrieved!.itemName).toBe(itemData.itemName);
          expect(retrieved!.quantityNeeded).toBe(itemData.quantityNeeded);
          expect(retrieved!.requireName).toBe(itemData.requireName);
          expect(retrieved!.requireContact).toBe(itemData.requireContact);
          expect(retrieved!.requireItemDetails).toBe(
            itemData.requireItemDetails
          );
          expect(retrieved!.displayOrder).toBe(itemData.displayOrder);
          expect(retrieved!.sheetId).toBe(sheet.id);
        }
      ),
      { numRuns: 20 }
    );
  }, 120000);
});
