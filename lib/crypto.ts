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
  const base64 = btoa(String.fromCharCode.apply(null, Array.from(bytes)));
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
 * Derive a key from a PIN using PBKDF2
 * @param pin - PIN string
 * @param salt - Salt as ArrayBuffer (should be random and stored)
 * @returns CryptoKey derived from PIN
 */
export async function deriveKeyFromPin(
  pin: string,
  salt: ArrayBuffer
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const pinData = encoder.encode(pin);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    pinData,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a CryptoKey using a PIN-derived key
 * @param key - The AES key to encrypt
 * @param pin - PIN string
 * @returns Object with encryptedKeyHex, keyIvHex, and saltHex
 */
export async function encryptKeyWithPin(
  key: CryptoKey,
  pin: string
): Promise<{ encryptedKeyHex: string; keyIvHex: string; saltHex: string }> {
  // Generate random salt for PIN derivation
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive key from PIN
  const pinKey = await deriveKeyFromPin(pin, salt.buffer);

  // Export the AES key to raw format
  const keyData = await crypto.subtle.exportKey("raw", key);

  // Generate IV for encrypting the key
  const keyIv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the AES key with PIN-derived key
  const encryptedKey = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: keyIv,
    },
    pinKey,
    keyData
  );

  return {
    encryptedKeyHex: arrayBufferToHex(encryptedKey),
    keyIvHex: arrayBufferToHex(keyIv.buffer),
    saltHex: arrayBufferToHex(salt.buffer),
  };
}

/**
 * Decrypt an encrypted key using a PIN
 * @param encryptedKeyHex - Encrypted key as hex string
 * @param keyIvHex - IV used for key encryption as hex string
 * @param saltHex - Salt used for PIN derivation as hex string
 * @param pin - PIN string
 * @returns Decrypted CryptoKey
 */
export async function decryptKeyWithPin(
  encryptedKeyHex: string,
  keyIvHex: string,
  saltHex: string,
  pin: string
): Promise<CryptoKey> {
  // Derive key from PIN using stored salt
  const salt = hexToArrayBuffer(saltHex);
  const pinKey = await deriveKeyFromPin(pin, salt);

  // Decrypt the AES key
  const encryptedKey = hexToArrayBuffer(encryptedKeyHex);
  const keyIv = hexToArrayBuffer(keyIvHex);

  const decryptedKeyData = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(keyIv),
    },
    pinKey,
    encryptedKey
  );

  // Import the decrypted key
  return await crypto.subtle.importKey(
    "raw",
    decryptedKeyData,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
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

/**
 * Decrypt encrypted data using a CryptoKey directly
 * @param encryptedHex - Encrypted data as hex string
 * @param key - CryptoKey for decryption
 * @param ivHex - Initialization vector as hex string
 * @returns Decrypted plain text
 */
export async function decryptWithKey(
  encryptedHex: string,
  key: CryptoKey,
  ivHex: string
): Promise<string> {
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

