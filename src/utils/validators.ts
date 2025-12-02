/**
 * Escapes HTML special characters to prevent XSS attacks.
 * Converts <, >, &, ", and ' to their HTML entity equivalents.
 *
 * @param input - The string to sanitize
 * @returns The sanitized string with HTML entities escaped
 */
export function escapeHtml(input: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return input.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}

/**
 * Validates that a string is not empty or only whitespace.
 *
 * @param value - The string to validate
 * @returns true if the string contains non-whitespace characters
 */
export function isNonEmptyString(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates that a number is a positive integer.
 *
 * @param value - The number to validate
 * @returns true if the number is a positive integer
 */
export function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

/**
 * Validates an email address format (basic validation).
 *
 * @param email - The email string to validate
 * @returns true if the email has a basic valid format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitizes user input by trimming whitespace and escaping HTML.
 *
 * @param input - The string to sanitize
 * @returns The sanitized string
 */
export function sanitizeInput(input: string): string {
  return escapeHtml(input.trim());
}
