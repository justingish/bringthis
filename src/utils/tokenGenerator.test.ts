import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateToken } from './tokenGenerator';

describe('tokenGenerator', () => {
  describe('generateToken', () => {
    it('should generate a non-empty string', () => {
      const token = generateToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate URL-safe tokens (no +, /, or =)', () => {
      const token = generateToken();
      expect(token).not.toMatch(/[+/=]/);
    });

    // Feature: signup-coordinator, Property 2: Generated links are unique
    // Validates: Requirements 1.3, 7.1, 8.1, 8.2, 9.1
    it('should generate unique tokens', () => {
      fc.assert(
        fc.property(fc.integer({ min: 2, max: 200 }), (count) => {
          // Generate multiple tokens
          const tokens = new Set<string>();
          for (let i = 0; i < count; i++) {
            tokens.add(generateToken());
          }

          // All tokens should be unique (set size equals count)
          return tokens.size === count;
        }),
        { numRuns: 100 }
      );
    });
  });
});
