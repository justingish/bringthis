import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  escapeHtml,
  isNonEmptyString,
  isPositiveInteger,
  isValidEmail,
  sanitizeInput,
  validateClaimForm,
} from './validators';

describe('validators', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
      expect(escapeHtml("It's a <test> & 'example'")).toBe(
        'It&#39;s a &lt;test&gt; &amp; &#39;example&#39;'
      );
    });

    it('should not modify strings without special characters', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });

    // Feature: signup-coordinator, Property 14: Input sanitization
    // Validates: Requirements 8.4
    it('should escape all HTML and script tags in any string', () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          const sanitized = escapeHtml(input);

          // The sanitized output should not contain raw HTML tags
          const hasRawTags = /<[^>]*>/.test(sanitized);

          // If the input contained < or >, they should be escaped
          if (input.includes('<') || input.includes('>')) {
            return (
              !hasRawTags &&
              (sanitized.includes('&lt;') || sanitized.includes('&gt;'))
            );
          }

          // If no special chars, output should equal input
          if (!/[&<>"']/.test(input)) {
            return sanitized === input;
          }

          // Otherwise, just verify no raw tags remain
          return !hasRawTags;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('isNonEmptyString', () => {
    it('should return true for non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true);
      expect(isNonEmptyString('a')).toBe(true);
    });

    it('should return false for empty or whitespace strings', () => {
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString('   ')).toBe(false);
      expect(isNonEmptyString('\t\n')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(undefined)).toBe(false);
    });
  });

  describe('isPositiveInteger', () => {
    it('should return true for positive integers', () => {
      expect(isPositiveInteger(1)).toBe(true);
      expect(isPositiveInteger(100)).toBe(true);
    });

    it('should return false for zero, negative numbers, and non-integers', () => {
      expect(isPositiveInteger(0)).toBe(false);
      expect(isPositiveInteger(-1)).toBe(false);
      expect(isPositiveInteger(1.5)).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid email formats', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace and escape HTML', () => {
      expect(sanitizeInput('  <script>alert("xss")</script>  ')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should handle normal text correctly', () => {
      expect(sanitizeInput('  Hello World  ')).toBe('Hello World');
    });
  });

  describe('validateClaimForm', () => {
    it('should return no errors when all required fields are provided', () => {
      const formData = {
        guestName: 'John Doe',
        guestContact: 'john@example.com',
        itemDetails: 'Chocolate cake',
      };
      const requirements = {
        requireName: true,
        requireContact: true,
        requireItemDetails: true,
      };

      const errors = validateClaimForm(formData, requirements);
      expect(errors).toEqual({});
    });

    it('should return error when required name is missing', () => {
      const formData = {
        guestName: '',
        guestContact: 'john@example.com',
        itemDetails: 'Chocolate cake',
      };
      const requirements = {
        requireName: true,
        requireContact: false,
        requireItemDetails: false,
      };

      const errors = validateClaimForm(formData, requirements);
      expect(errors.guestName).toBe('Name is required');
      expect(errors.guestContact).toBeUndefined();
      expect(errors.itemDetails).toBeUndefined();
    });

    it('should return error when required contact is missing', () => {
      const formData = {
        guestName: 'John Doe',
        guestContact: '   ',
        itemDetails: 'Chocolate cake',
      };
      const requirements = {
        requireName: true,
        requireContact: true,
        requireItemDetails: false,
      };

      const errors = validateClaimForm(formData, requirements);
      expect(errors.guestName).toBeUndefined();
      expect(errors.guestContact).toBe('Contact information is required');
      expect(errors.itemDetails).toBeUndefined();
    });

    it('should return error when required item details are missing', () => {
      const formData = {
        guestName: 'John Doe',
        guestContact: 'john@example.com',
        itemDetails: undefined,
      };
      const requirements = {
        requireName: true,
        requireContact: false,
        requireItemDetails: true,
      };

      const errors = validateClaimForm(formData, requirements);
      expect(errors.guestName).toBeUndefined();
      expect(errors.guestContact).toBeUndefined();
      expect(errors.itemDetails).toBe('Item details are required');
    });

    it('should return multiple errors when multiple required fields are missing', () => {
      const formData = {
        guestName: '',
        guestContact: '',
        itemDetails: '',
      };
      const requirements = {
        requireName: true,
        requireContact: true,
        requireItemDetails: true,
      };

      const errors = validateClaimForm(formData, requirements);
      expect(errors.guestName).toBe('Name is required');
      expect(errors.guestContact).toBe('Contact information is required');
      expect(errors.itemDetails).toBe('Item details are required');
    });

    it('should not return errors for optional fields that are empty', () => {
      const formData = {
        guestName: 'John Doe',
        guestContact: '',
        itemDetails: '',
      };
      const requirements = {
        requireName: true,
        requireContact: false,
        requireItemDetails: false,
      };

      const errors = validateClaimForm(formData, requirements);
      expect(errors).toEqual({});
    });

    // Feature: signup-coordinator, Property 9: Required field validation
    // Validates: Requirements 5.2
    it('should reject claim when any required field is missing', () => {
      // Generator for form data with potentially empty/missing fields
      const formDataArb = fc.record({
        guestName: fc.option(fc.string(), { nil: undefined }),
        guestContact: fc.option(fc.string(), { nil: undefined }),
        itemDetails: fc.option(fc.string(), { nil: undefined }),
      });

      // Generator for item requirements
      const requirementsArb = fc.record({
        requireName: fc.boolean(),
        requireContact: fc.boolean(),
        requireItemDetails: fc.boolean(),
      });

      fc.assert(
        fc.property(formDataArb, requirementsArb, (formData, requirements) => {
          const errors = validateClaimForm(formData, requirements);

          // Check if name is required but missing/empty
          const nameInvalid =
            requirements.requireName &&
            (!formData.guestName || formData.guestName.trim() === '');

          // Check if contact is required but missing/empty
          const contactInvalid =
            requirements.requireContact &&
            (!formData.guestContact || formData.guestContact.trim() === '');

          // Check if item details are required but missing/empty
          const detailsInvalid =
            requirements.requireItemDetails &&
            (!formData.itemDetails || formData.itemDetails.trim() === '');

          // If any required field is invalid, there should be errors
          if (nameInvalid || contactInvalid || detailsInvalid) {
            // Should have at least one error
            const hasErrors = Object.keys(errors).length > 0;
            return hasErrors;
          }

          // If all required fields are valid, there should be no errors
          return Object.keys(errors).length === 0;
        }),
        { numRuns: 100 }
      );
    });
  });
});
