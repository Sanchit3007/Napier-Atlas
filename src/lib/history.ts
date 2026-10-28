// A visitor's history key: a random token that groups their saved estimates without any login.
// Anyone with the key can see that history, so it is long enough that it can't be guessed.

const STORAGE_KEY = 'napieratlas-history-key';
const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';

// Checks a value looks like a real history key (20 lowercase letters and digits).
export function isHistoryKey(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z2-9]{20}$/.test(value);
}

// This browser's saved history key, or null if it has none yet.
export function readHistoryKey(): string | null {
  try {
    const key = localStorage.getItem(STORAGE_KEY);
    return isHistoryKey(key) ? key : null;
  } catch {
    return null; // storage blocked, e.g. some private windows
  }
}

// Stores the history key in this browser so the visitor's history opens next time.
export function rememberHistoryKey(key: string) {
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch {
    // Without storage the visitor can still use the history link itself.
  }
}

// Returns this browser's key, creating one the first time an estimate is saved.
export function ensureHistoryKey(): string {
  const existing = readHistoryKey();
  if (existing) return existing;
  const key = Array.from(crypto.getRandomValues(new Uint8Array(20)), (b) => ALPHABET[b % ALPHABET.length]).join('');
  rememberHistoryKey(key);
  return key;
}
