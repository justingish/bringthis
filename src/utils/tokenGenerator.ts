/**
 * Generates a cryptographically secure random token using the Web Crypto API.
 * The token is 32 bytes (256 bits) of random data, encoded as a URL-safe base64 string.
 *
 * @returns A URL-safe base64-encoded token string
 */
export function generateToken(): string {
  // Generate 32 bytes of cryptographically secure random data
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);

  // Convert to base64
  const base64 = btoa(String.fromCharCode(...array));

  // Make URL-safe by replacing + with - and / with _
  const urlSafe = base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return urlSafe;
}
