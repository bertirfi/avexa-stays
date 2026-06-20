'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { writeUser, clearUser } from '@/lib/booking';

interface AuthValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthValue>({ user: null, loading: true });

/**
 * Mirrors the real Supabase session into the existing `avexa_user` localStorage
 * shape + the `avexa:auth-changed` event, so the app's many client components
 * keep reacting to login state without each needing a rewrite. The SESSION (the
 * source of truth) lives in httpOnly cookies managed by @supabase/ssr — only the
 * display name/email is mirrored, never a token.
 */
function mirrorToLocalStorage(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    const fullName =
      (user.user_metadata?.full_name as string | undefined)?.trim() || '';
    const [firstName, ...rest] = fullName.split(/\s+/).filter(Boolean);
    writeUser({
      loggedIn: true,
      email: user.email ?? undefined,
      firstName: firstName || undefined,
      lastName: rest.join(' ') || undefined,
      name: fullName || user.email || undefined,
      method: 'email',
    });
  } else {
    clearUser();
  }
  window.dispatchEvent(new Event('avexa:auth-changed'));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
      mirrorToLocalStorage(data.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      mirrorToLocalStorage(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
