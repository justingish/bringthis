import { describe, it, expect } from 'vitest';
import {
  formatEventDate,
  formatDateForInput,
  parseDateFromInput,
  formatTimestamp,
} from './dateFormatter';

describe('dateFormatter', () => {
  describe('formatEventDate', () => {
    it('should format a Date object correctly', () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      const formatted = formatEventDate(date);
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should format an ISO string correctly', () => {
      const isoString = '2024-01-15';
      const formatted = formatEventDate(isoString);
      expect(formatted).toContain('January');
      expect(formatted).toContain('2024');
    });
  });

  describe('formatDateForInput', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      expect(formatDateForInput(date)).toBe('2024-01-15');
    });

    it('should pad single-digit months and days', () => {
      const date = new Date(2024, 0, 5); // January 5, 2024
      expect(formatDateForInput(date)).toBe('2024-01-05');
    });
  });

  describe('parseDateFromInput', () => {
    it('should parse YYYY-MM-DD format correctly', () => {
      const date = parseDateFromInput('2024-01-15');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(15);
    });

    it('should handle single-digit months and days', () => {
      const date = parseDateFromInput('2024-03-05');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(2); // March is 2
      expect(date.getDate()).toBe(5);
    });
  });

  describe('formatTimestamp', () => {
    it('should format a Date object with time', () => {
      const date = new Date(2024, 0, 15, 15, 30); // January 15, 2024, 3:30 PM
      const formatted = formatTimestamp(date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
      expect(formatted).toContain('3:30');
      expect(formatted).toContain('PM');
    });

    it('should format an ISO string with time', () => {
      const isoString = '2024-01-15T15:30:00';
      const formatted = formatTimestamp(isoString);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('2024');
    });
  });

  describe('round-trip formatting', () => {
    it('should maintain date integrity through format and parse cycle', () => {
      const originalDate = new Date(2024, 5, 20); // June 20, 2024
      const formatted = formatDateForInput(originalDate);
      const parsed = parseDateFromInput(formatted);

      expect(parsed.getFullYear()).toBe(originalDate.getFullYear());
      expect(parsed.getMonth()).toBe(originalDate.getMonth());
      expect(parsed.getDate()).toBe(originalDate.getDate());
    });
  });
});
