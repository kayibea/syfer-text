import './style.css';
import { decryptAES, encryptAES } from './utils/crypto';

const $ = document.getElementById.bind(document);

const keyInput = $('key') as HTMLInputElement;
const btnCopy = $('copyOutput') as HTMLButtonElement;
const outputText = $('outputText') as HTMLDivElement;
const btnEncrypt = $('encrypt') as HTMLButtonElement;
const btnDecrypt = $('decrypt') as HTMLButtonElement;
const inputText = $('inputText') as HTMLTextAreaElement;

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

function handleCopyText() {
  navigator.clipboard
    .writeText(outputText.innerText)
    .then(() => {
      btnCopy.textContent = 'Copied!';
      setTimeout(() => (btnCopy.textContent = 'Copy Output'), 2000);
    })
    .catch((err) => console.error(err));
}

function toogleKeyVisivility(hide: boolean) {
  const attr = keyInput.attributes.getNamedItem('type');
  if (attr) attr.value = hide ? 'password' : 'text';
}

btnCopy.addEventListener('click', handleCopyText);
btnEncrypt.addEventListener('click', encryptText);
btnDecrypt.addEventListener('click', decryptText);
keyInput.addEventListener('mouseover', () => toogleKeyVisivility(false));
keyInput.addEventListener('mouseleave', () => toogleKeyVisivility(true));
