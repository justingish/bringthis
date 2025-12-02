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

/**
 * Validation errors for claim form fields.
 */
export interface ClaimFormValidationErrors {
  guestName?: string;
  guestContact?: string;
  itemDetails?: string;
}

/**
 * Validates claim form data based on item requirements.
 * Returns an object with error messages for each invalid field.
 *
 * @param formData - The claim form data to validate
 * @param itemRequirements - The item's field requirements
 * @returns An object with error messages for invalid fields, or empty object if valid
 */
export function validateClaimForm(
  formData: {
    guestName?: string;
    guestContact?: string;
    itemDetails?: string;
  },
  itemRequirements: {
    requireName: boolean;
    requireContact: boolean;
    requireItemDetails: boolean;
  }
): ClaimFormValidationErrors {
  const errors: ClaimFormValidationErrors = {};

  // Validate guest name if required
  if (itemRequirements.requireName && !isNonEmptyString(formData.guestName)) {
    errors.guestName = 'Name is required';
  }

  // Validate guest contact if required
  if (
    itemRequirements.requireContact &&
    !isNonEmptyString(formData.guestContact)
  ) {
    errors.guestContact = 'Contact information is required';
  }

  // Validate item details if required
  if (
    itemRequirements.requireItemDetails &&
    !isNonEmptyString(formData.itemDetails)
  ) {
    errors.itemDetails = 'Item details are required';
  }

  return errors;
}
