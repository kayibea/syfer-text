import './style.css';

const inputText = document.getElementById('inputText') as HTMLTextAreaElement;
const keyInput = document.getElementById('key') as HTMLInputElement;
const outputText = document.getElementById('outputText') as HTMLDivElement;

// const dropzone = document.getElementById('dropzone') as HTMLDivElement;
// const fileInput = document.getElementById('fileInput') as HTMLInputElement;

const btnEncrypt = document.getElementById('encrypt') as HTMLButtonElement;
const btnDecrypt = document.getElementById('decrypt') as HTMLButtonElement;

async function encryptText() {
  try {
    const plaintext = inputText.value;
    const password = keyInput.value;
    if (!password) return alert('Please provide a password.');
    const encrypted = await encryptAES(plaintext, password);
    outputText.textContent = encrypted;
  } catch (err) {
    outputText.textContent = 'Encryption failed.';
  }
}

async function decryptText() {
  try {
    const encrypted = inputText.value;
    const password = keyInput.value;
    if (!password) return alert('Please provide a password.');
    const decrypted = await decryptAES(encrypted, password);
    outputText.textContent = decrypted;
  } catch (err) {
    outputText.textContent = 'Decryption failed. Wrong password or corrupted data.';
  }
}

function encode(str: string): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(str);
}

function decode(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}

function toBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function getKeyFromPassword(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey('raw', encode(password), { name: 'PBKDF2' }, false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptAES(plaintext: string, password: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await getKeyFromPassword(password, salt);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encode(plaintext));

  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

  return toBase64(combined.buffer);
}

async function decryptAES(encryptedBase64: string, password: string): Promise<string> {
  const combined = new Uint8Array(fromBase64(encryptedBase64));
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const data = combined.slice(28);

  const key = await getKeyFromPassword(password, salt);

  const plaintextBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);

  return decode(plaintextBuffer);
}

// dropzone.addEventListener('click', () => fileInput.click());

// dropzone.addEventListener('dragover', (e) => {
//   e.preventDefault();
//   dropzone.classList.add('dragover');
// });

// dropzone.addEventListener('dragleave', () => {
//   dropzone.classList.remove('dragover');
// });

// dropzone.addEventListener('drop', (e) => {
//   e.preventDefault();
//   dropzone.classList.remove('dragover');
//   const files = e.dataTransfer?.files;
//   if (files && files.length) {
//     fileInput.files = files;
//     console.log('File dropped:', files[0].name);
//   }
// });

btnEncrypt.addEventListener('click', encryptText);
btnDecrypt.addEventListener('click', decryptText);
