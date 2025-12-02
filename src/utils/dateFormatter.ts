/**
 * Formats a date for display in a user-friendly format.
 * Example: "Monday, January 15, 2024"
 *
 * @param date - The date to format (Date object or ISO string)
 * @returns A formatted date string
 */
export function formatEventDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats a date for HTML date input (YYYY-MM-DD format).
 *
 * @param date - The date to format
 * @returns A date string in YYYY-MM-DD format
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Parses a date string from HTML date input (YYYY-MM-DD format).
 *
 * @param dateString - The date string to parse
 * @returns A Date object
 */
export function parseDateFromInput(dateString: string): Date {
  // Parse as local date (not UTC) to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats a timestamp for display (e.g., "Jan 15, 2024 at 3:30 PM").
 *
 * @param date - The date/time to format
 * @returns A formatted timestamp string
 */
export function formatTimestamp(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
