/**
 * Hashes a string using SHA-256 via the Web Crypto API.
 * Returns a hex-encoded digest string.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data    = encoder.encode(password);
  const buffer  = await crypto.subtle.digest('SHA-256', data);
  const array   = Array.from(new Uint8Array(buffer));
  return array.map(b => b.toString(16).padStart(2, '0')).join('');
}
