// Sparks has a single night theme: the sky data are dark and the logo's light
// reads on night. Only the small localStorage helpers live here.

export function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

export function writeFlag(key: string) {
  try {
    localStorage.setItem(key, '1');
  } catch {
    /* ignore */
  }
}
