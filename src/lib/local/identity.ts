/** Local session identity: who owns the data currently held on this device. */

export type SessionMode = 'guest' | 'cloud' | 'none';

const GUEST_ID_KEY = 'terrazzo-guest-id';
const MODE_KEY = 'terrazzo-session-mode';

const read = (key: string): string | null => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const write = (key: string, value: string) => {
  try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
};

/** Stable, offline-created identity used for all local records in guest mode. */
export const getGuestId = (): string => {
  const existing = read(GUEST_ID_KEY);
  if (existing) return existing;
  const id = `guest-${
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2)
  }`;
  write(GUEST_ID_KEY, id);
  return id;
};

export const getStoredMode = (): SessionMode => {
  const raw = read(MODE_KEY);
  return raw === 'guest' || raw === 'cloud' ? raw : 'none';
};

export const setStoredMode = (mode: SessionMode) => write(MODE_KEY, mode);

interface Identity {
  mode: SessionMode;
  /** Supabase user id when signed in, otherwise the guest id. */
  ownerId: string;
}

let current: Identity = { mode: getStoredMode(), ownerId: getGuestId() };

export const setIdentity = (next: Identity) => {
  current = next;
  if (next.mode !== 'none') setStoredMode(next.mode);
};

export const getIdentity = (): Identity => current;

/** Owner id to stamp on / filter local rows by. */
export const localOwnerId = (): string => current.ownerId || getGuestId();

export const isCloudSession = (): boolean => current.mode === 'cloud';
