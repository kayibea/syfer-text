export const encode = (str: string): Uint8Array<ArrayBuffer> => {
  return new TextEncoder().encode(str);
};

export const decode = (buf: ArrayBuffer): string => {
  return new TextDecoder().decode(buf);
};

export const toBase64 = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

export const fromBase64 = (base64: string): Uint8Array<ArrayBuffer> => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};
