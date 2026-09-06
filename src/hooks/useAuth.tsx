import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import {
  getGuestId,
  getStoredMode,
  setIdentity,
  setStoredMode,
  type SessionMode,
} from '@/lib/local/identity';
import { seedLocalData } from '@/lib/local/localPresetService';

interface AuthCtx {
  session: Session | null;
  user: User | null;
  /** 'cloud' = signed in, 'guest' = local-only device session, 'none' = nothing chosen yet. */
  mode: SessionMode;
  isGuest: boolean;
  /** True when the app may be used (cloud session or guest session). */
  hasAccess: boolean;
  guestId: string;
  loading: boolean;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  session: null,
  user: null,
  mode: 'none',
  isGuest: false,
  hasAccess: false,
  guestId: '',
  loading: false,
  continueAsGuest: () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [mode, setMode] = useState<SessionMode>(() => getStoredMode());
  // Startup never waits for the backend — local state resolves immediately.
  const [loading, setLoading] = useState(false);
  const guestId = getGuestId();

  useEffect(() => {
    seedLocalData();

    // Local identity is applied right away so offline reads work on first paint.
    const stored = getStoredMode();
    setIdentity({ mode: stored, ownerId: guestId });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        setMode('cloud');
        setIdentity({ mode: 'cloud', ownerId: s.user.id });
      } else if (getStoredMode() === 'guest') {
        setMode('guest');
        setIdentity({ mode: 'guest', ownerId: guestId });
      }
    });

    // Background refresh; failures are ignored so offline start-up is instant.
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session?.user) {
          setSession(data.session);
          setMode('cloud');
          setIdentity({ mode: 'cloud', ownerId: data.session.user.id });
        }
      })
      .catch(() => {});

    return () => sub.subscription.unsubscribe();
  }, [guestId]);

  const continueAsGuest = useCallback(() => {
    setStoredMode('guest');
    setIdentity({ mode: 'guest', ownerId: guestId });
    setMode('guest');
    seedLocalData();
  }, [guestId]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      /* offline sign-out is still a local sign-out */
    }
    setSession(null);
    // Keep working offline instead of locking the user out.
    setStoredMode('guest');
    setIdentity({ mode: 'guest', ownerId: guestId });
    setMode('guest');
  }, [guestId]);

  const isGuest = mode === 'guest' && !session;

  return (
    <Ctx.Provider
      value={{
        session,
        user: session?.user ?? null,
        mode,
        isGuest,
        hasAccess: !!session || mode === 'guest',
        guestId,
        loading,
        continueAsGuest,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
