import { useEffect, useState } from 'react';
import { isCloudSession } from './identity';

export const isOnline = (): boolean => {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine !== false;
};

/** True only when we may legitimately talk to the backend. */
export const cloudActive = (): boolean => isCloudSession() && isOnline();

export const useConnection = () => {
  const [online, setOnline] = useState(isOnline());
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  return { online };
};

/** Network / auth failures that must never break the offline app. */
export const isOfflineLikeError = (error: unknown): boolean => {
  const msg = (error instanceof Error ? error.message : String(error ?? '')).toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network request failed') ||
    msg.includes('load failed') ||
    msg.includes('timeout') ||
    msg.includes('auth session') ||
    msg.includes('jwt') ||
    msg.includes('sign in required') ||
    msg.includes('fetch')
  );
};
