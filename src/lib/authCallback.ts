import { supabase } from '@/integrations/supabase/client';
import { isNativeApp } from './platform';

export const APP_ID = 'ug.co.terrazzo.quotation';
export const NATIVE_AUTH_CALLBACK = `${APP_ID}://auth/callback`;
export const NATIVE_RESET_CALLBACK = `${APP_ID}://reset-password`;

const WEB_AUTH_NEXT_KEY = 'terrazzo:web-auth-next';

const safeNext = (value: string | null): string => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard';
  return value;
};

export const rememberWebAuthNext = (value: string): void => {
  if (isNativeApp() || typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(WEB_AUTH_NEXT_KEY, safeNext(value));
  } catch {
    // sessionStorage can be unavailable in restricted browser contexts.
  }
};

const consumeWebAuthNext = (): string => {
  if (isNativeApp() || typeof window === 'undefined') return '/dashboard';
  try {
    const value = window.sessionStorage.getItem(WEB_AUTH_NEXT_KEY);
    window.sessionStorage.removeItem(WEB_AUTH_NEXT_KEY);
    return safeNext(value);
  } catch {
    return '/dashboard';
  }
};

export const getAuthRedirectUrl = (path: '/auth/callback' | '/reset-password' = '/auth/callback'): string => {
  if (isNativeApp()) {
    return path === '/reset-password' ? NATIVE_RESET_CALLBACK : NATIVE_AUTH_CALLBACK;
  }
  return `${window.location.origin}${path}`;
};

const getHashParams = (url: URL): URLSearchParams => {
  const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
  return new URLSearchParams(hash);
};

export const handleAuthCallbackUrl = async (rawUrl: string): Promise<string> => {
  const url = new URL(rawUrl);
  const query = url.searchParams;
  const hash = getHashParams(url);
  const code = query.get('code');

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
  } else {
    const accessToken = hash.get('access_token') || query.get('access_token');
    const refreshToken = hash.get('refresh_token') || query.get('refresh_token');
    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) throw error;
    }
  }

  const type = hash.get('type') || query.get('type');
  const isRecovery = type === 'recovery' || url.pathname.includes('reset-password') || url.host === 'reset-password';
  if (isRecovery) return '/reset-password';

  const callbackNext = query.get('next') || hash.get('next');
  return callbackNext ? safeNext(callbackNext) : consumeWebAuthNext();
};
