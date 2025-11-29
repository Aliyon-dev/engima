/**
 * Client-side encryption/decryption utilities using Web Crypto API
 * All operations happen in the browser - server never sees plaintext
 */

/**
 * Generate a random AES-GCM encryption key
 */
export async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // extractable - needed to serialize for URL storage
    ["encrypt", "decrypt"]
  );
}

/**
 * Convert ArrayBuffer to hexadecimal string
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Convert hexadecimal string to ArrayBuffer
 */
function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

/**
 * Export CryptoKey to base64 string for URL storage
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("raw", key);
  const bytes = new Uint8Array(exported);
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64;
}

/**
 * Import CryptoKey from base64 string
 */
export async function importKey(base64: string): Promise<CryptoKey> {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return await crypto.subtle.importKey(
    "raw",
    bytes.buffer,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt text using AES-GCM
 * @param text - Plain text to encrypt
 * @param key - CryptoKey for encryption
 * @returns Object with encryptedHex and ivHex
 */
export async function encrypt(
  text: string,
  key: CryptoKey
): Promise<{ encryptedHex: string; ivHex: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // Generate random IV (12 bytes for AES-GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data
  );

  return {
    encryptedHex: arrayBufferToHex(encrypted),
    ivHex: arrayBufferToHex(iv.buffer),
  };
}

/**
 * Decrypt encrypted data using AES-GCM
 * @param encryptedHex - Encrypted data as hex string
 * @param keyHex - Base64 encoded key string
 * @param ivHex - Initialization vector as hex string
 * @returns Decrypted plain text
 */
export async function decrypt(
  encryptedHex: string,
  keyHex: string,
  ivHex: string
): Promise<string> {
  const key = await importKey(keyHex);
  const encrypted = hexToArrayBuffer(encryptedHex);
  const iv = hexToArrayBuffer(ivHex);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(iv),
    },
    key,
    encrypted
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

