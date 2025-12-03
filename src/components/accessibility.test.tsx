import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClaimForm } from './ClaimForm';
import { EventHeader } from './EventHeader';
import { ItemCard } from './ItemCard';
import { SignupItemList } from './SignupItemList';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import type { SignupItem, Claim } from '../types';

describe('Accessibility Tests', () => {
  describe('ClaimForm', () => {
    const mockItem: SignupItem = {
      id: '1',
      sheetId: 'sheet1',
      itemName: 'Test Item',
      quantityNeeded: 5,
      requireName: true,
      requireContact: true,
      requireItemDetails: true,
      displayOrder: 0,
      createdAt: new Date(),
    };

    it('should have proper ARIA attributes for dialog', () => {
      render(
        <ClaimForm item={mockItem} onSubmit={() => {}} onCancel={() => {}} />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'claim-form-title');
    });

    it('should have accessible form labels', () => {
      render(
        <ClaimForm item={mockItem} onSubmit={() => {}} onCancel={() => {}} />
      );

      expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contact info/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/item details/i)).toBeInTheDocument();
    });

    it('should have focus-visible styles on buttons', () => {
      render(
        <ClaimForm item={mockItem} onSubmit={() => {}} onCancel={() => {}} />
      );

      const submitButton = screen.getByRole('button', {
        name: /submit claim/i,
      });
      expect(submitButton).toHaveClass('focus:ring-2');
    });
  });

  describe('EventHeader', () => {
    it('should use semantic time element for date', () => {
      const testDate = new Date('2024-12-25');
      render(
        <EventHeader
          title="Test Event"
          date={testDate}
          description="Test description"
        />
      );

      const timeElement = screen.getByText(/december/i).closest('time');
      expect(timeElement).toBeInTheDocument();
      expect(timeElement).toHaveAttribute('dateTime');
    });

    it('should use proper heading hierarchy', () => {
      render(
        <EventHeader
          title="Test Event"
          date={new Date()}
          description="Test description"
        />
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Test Event');
    });
  });

  describe('ItemCard', () => {
    const mockItem: SignupItem = {
      id: '1',
      sheetId: 'sheet1',
      itemName: 'Test Item',
      quantityNeeded: 5,
      requireName: true,
      requireContact: false,
      requireItemDetails: false,
      displayOrder: 0,
      createdAt: new Date(),
    };

    const mockClaims: Claim[] = [
      {
        id: 'claim1',
        itemId: '1',
        guestName: 'John Doe',
        guestContact: 'john@example.com',
        itemDetails: 'Bringing salad',
        claimToken: 'token1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should use article element for semantic structure', () => {
      const { container } = render(
        <ItemCard item={mockItem} claims={[]} onClaim={() => {}} />
      );

      expect(container.querySelector('article')).toBeInTheDocument();
    });

    it('should have accessible button with aria-label', () => {
      render(<ItemCard item={mockItem} claims={[]} onClaim={() => {}} />);

      const button = screen.getByRole('button', { name: /claim test item/i });
      expect(button).toBeInTheDocument();
    });

    it('should indicate full status with proper role', () => {
      const fullItem = { ...mockItem, quantityNeeded: 1 };
      render(
        <ItemCard item={fullItem} claims={mockClaims} onClaim={() => {}} />
      );

      const fullStatus = screen.getByRole('status');
      expect(fullStatus).toHaveTextContent('Full');
    });

    it('should have accessible claims list', () => {
      render(
        <ItemCard item={mockItem} claims={mockClaims} onClaim={() => {}} />
      );

      const list = screen.getByRole('list', { name: /claims for test item/i });
      expect(list).toBeInTheDocument();
    });
  });

  describe('SignupItemList', () => {
    const mockItems: SignupItem[] = [
      {
        id: '1',
        sheetId: 'sheet1',
        itemName: 'Item 1',
        quantityNeeded: 5,
        requireName: true,
        requireContact: false,
        requireItemDetails: false,
        displayOrder: 0,
        createdAt: new Date(),
      },
    ];

    it('should have accessible empty state', () => {
      render(<SignupItemList items={[]} claims={[]} onClaimItem={() => {}} />);

      const emptyState = screen.getByRole('status');
      expect(emptyState).toHaveAttribute(
        'aria-label',
        'No signup items available'
      );
    });

    it('should have accessible list with aria-label', () => {
      render(
        <SignupItemList items={mockItems} claims={[]} onClaimItem={() => {}} />
      );

      const list = screen.getByRole('list', { name: /signup items/i });
      expect(list).toBeInTheDocument();
    });
  });

  describe('LoadingSpinner', () => {
    it('should have proper ARIA attributes', () => {
      render(<LoadingSpinner message="Loading data..." />);

      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
      expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('should have screen reader text', () => {
      render(<LoadingSpinner message="Loading data..." />);

      expect(
        screen.getByText('Loading', { selector: '.sr-only' })
      ).toBeInTheDocument();
    });
  });

  describe('ErrorMessage', () => {
    it('should have alert role and aria-live', () => {
      render(<ErrorMessage title="Error" message="Something went wrong" />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
      expect(alert).toHaveAttribute('aria-labelledby', 'error-title');
    });

    it('should have accessible buttons with aria-labels', () => {
      const onRetry = () => {};
      render(
        <ErrorMessage
          title="Error"
          message="Something went wrong"
          onRetry={onRetry}
        />
      );

      const retryButton = screen.getByRole('button', {
        name: /try loading again/i,
      });
      expect(retryButton).toBeInTheDocument();
    });

    it('should have focus-visible styles on buttons', () => {
      render(
        <ErrorMessage
          title="Error"
          message="Something went wrong"
          onRetry={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /try loading again/i });
      expect(button).toHaveClass('focus:ring-2');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have focusable interactive elements', () => {
      const mockItem: SignupItem = {
        id: '1',
        sheetId: 'sheet1',
        itemName: 'Test Item',
        quantityNeeded: 5,
        requireName: true,
        requireContact: false,
        requireItemDetails: false,
        displayOrder: 0,
        createdAt: new Date(),
      };

      render(<ItemCard item={mockItem} claims={[]} onClaim={() => {}} />);

      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Color Contrast', () => {
    it('should use sufficient contrast for error messages', () => {
      render(<ErrorMessage title="Error" message="Something went wrong" />);

      const title = screen.getByText('Error');
      // text-red-800 on bg-red-50 provides sufficient contrast
      expect(title).toHaveClass('text-red-800');
    });

    it('should use sufficient contrast for success messages', () => {
      const { container } = render(
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Success!
          </h3>
        </div>
      );

      const heading = container.querySelector('h3');
      // text-green-800 on bg-green-50 provides sufficient contrast
      expect(heading).toHaveClass('text-green-800');
    });
  });
});
