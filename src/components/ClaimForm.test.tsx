import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { ClaimForm } from './ClaimForm';
import type { SignupItem } from '../types';

afterEach(() => {
  cleanup();
});

describe('ClaimForm', () => {
  // Feature: signup-coordinator, Property 4: Claim form matches item requirements
  // Validates: Requirements 2.4, 5.1
  it('should render exactly the fields specified by item requirements', () => {
    // Generator for signup items with random field requirements
    const signupItemArb = fc.record({
      id: fc.uuid(),
      sheetId: fc.uuid(),
      itemName: fc.string({ minLength: 1, maxLength: 50 }),
      quantityNeeded: fc.integer({ min: 1, max: 100 }),
      requireName: fc.boolean(),
      requireContact: fc.boolean(),
      requireItemDetails: fc.boolean(),
      displayOrder: fc.integer({ min: 0, max: 100 }),
      createdAt: fc.date(),
    });

    fc.assert(
      fc.property(signupItemArb, (item: SignupItem) => {
        const mockOnSubmit = vi.fn();
        const mockOnCancel = vi.fn();

        const { unmount } = render(
          <ClaimForm
            item={item}
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        );

        // Check if name field is present based on requireName
        // Use document.querySelector since the modal renders with fixed positioning
        const nameField = document.querySelector('#guestName');
        const nameFieldPresent = nameField !== null;

        // Check if contact field is present based on requireContact
        const contactField = document.querySelector('#guestContact');
        const contactFieldPresent = contactField !== null;

        // Check if item details field is present based on requireItemDetails
        const detailsField = document.querySelector('#itemDetails');
        const detailsFieldPresent = detailsField !== null;

        // Verify that fields match requirements exactly
        const nameMatches = nameFieldPresent === item.requireName;
        const contactMatches = contactFieldPresent === item.requireContact;
        const detailsMatches = detailsFieldPresent === item.requireItemDetails;

        // Clean up immediately after checking to prevent DOM pollution
        unmount();

        return nameMatches && contactMatches && detailsMatches;
      }),
      { numRuns: 100 }
    );
  });

  it('should display item name in the form header', () => {
    const mockItem: SignupItem = {
      id: '1',
      sheetId: 'sheet-1',
      itemName: 'Test Item',
      quantityNeeded: 5,
      requireName: true,
      requireContact: false,
      requireItemDetails: false,
      displayOrder: 0,
      createdAt: new Date(),
    };

    render(<ClaimForm item={mockItem} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText(/Claim: Test Item/i)).toBeDefined();
  });

  it('should render submit and cancel buttons', () => {
    const mockItem: SignupItem = {
      id: '1',
      sheetId: 'sheet-1',
      itemName: 'Test Item',
      quantityNeeded: 5,
      requireName: true,
      requireContact: false,
      requireItemDetails: false,
      displayOrder: 0,
      createdAt: new Date(),
    };

    render(<ClaimForm item={mockItem} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText('Submit Claim')).toBeDefined();
    expect(screen.getByText('Cancel')).toBeDefined();
  });
});
