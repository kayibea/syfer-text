import { IV_LEN, PBKDF2_ITER, SALT_LEN } from '../constants';
import { decode, encode, fromBase64, toBase64 } from './util';

const deriveKeyAES = async (secret: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey('raw', encode(secret), { name: 'PBKDF2' }, false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITER,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
};

export const encryptAES = async (plaintext: string, password: string): Promise<string> => {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const aesCryptoKey = await deriveKeyAES(password, salt);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesCryptoKey, encode(plaintext));

  const combined = new Uint8Array(IV_LEN + SALT_LEN + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(salt, IV_LEN);
  combined.set(new Uint8Array(ciphertext), IV_LEN + SALT_LEN);

  return toBase64(combined.buffer);
};

export const decryptAES = async (encryptedBase64: string, password: string): Promise<string> => {
  const combined = new Uint8Array(fromBase64(encryptedBase64));

  const iv = combined.slice(0, IV_LEN);
  const salt = combined.slice(IV_LEN, IV_LEN + SALT_LEN);
  const data = combined.slice(IV_LEN + SALT_LEN);

  const aesCryptoKey = await deriveKeyAES(password, salt);
  const plaintextBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesCryptoKey, data);

  return decode(plaintextBuffer);
};
