import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  escapeHtml,
  isNonEmptyString,
  isPositiveInteger,
  isValidEmail,
  sanitizeInput,
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
});
