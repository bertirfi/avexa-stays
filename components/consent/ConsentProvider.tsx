'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * GDPR/ePrivacy consent state — first-party, no third-party CMP.
 *
 * Categories (the real inventory, from the code):
 * - necessary (always on, exempt): Supabase auth cookies (sb-*, httpOnly, set
 *   by @supabase/ssr on sign-in), the `avexa_consent` record itself, and the
 *   functional localStorage keys `avexa_search` / `avexa_currency` /
 *   `avexa_booking`. Stripe runs on its own hosted checkout at stripe.com —
 *   nothing from Stripe loads on our origin.
 * - analytics: reserved, NOT in use (v1) — always stored false. When
 *   PostHog/GA4 ships, bump CONSENT_VERSION so every visitor is re-asked.
 *
 * Google Maps (JS API on /locations, Embed iframe on stay pages) loads with
 * the page and is disclosed in the Cookie Policy — client decision 25.08:
 * the map always renders, it is not a toggleable category.
 */
export const CONSENT_VERSION = 1;

const STORAGE_KEY = 'avexa_consent';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 6 months, then we ask again

export interface ConsentChoices {
  analytics: boolean;
}

export interface ConsentState extends ConsentChoices {
  version: number;
  /** ISO timestamp of when the choice was made (proof of consent). */
  timestamp: string;
  necessary: true;
}

function readCookieValue(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)avexa_consent=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * The first-party cookie is the ONLY store — its max-age enforces the
 * "6 months, then we ask again" promise from the Cookie Policy. (A
 * localStorage copy would never expire and silently break that promise;
 * cookies-disabled visitors simply get re-asked each visit — fail-safe.)
 */
function readStored(): ConsentState | null {
  try {
    const raw = readCookieValue();
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    // Version bump (categories changed) → treat as absent and re-prompt.
    if (parsed.version !== CONSENT_VERSION) return null;
    if (typeof parsed.analytics !== 'boolean') return null;
    return {
      version: CONSENT_VERSION,
      timestamp: typeof parsed.timestamp === 'string' ? parsed.timestamp : new Date().toISOString(),
      necessary: true,
      analytics: parsed.analytics,
    };
  } catch {
    return null;
  }
}

function persist(state: ConsentState) {
  const json = JSON.stringify(state);
  try {
    document.cookie = `${STORAGE_KEY}=${encodeURIComponent(json)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax; Secure`;
  } catch {
    // Non-fatal — the banner will simply re-ask next visit.
  }
}

interface ConsentContextValue {
  /** null = no valid choice yet (also during SSR and before hydration). */
  consent: ConsentState | null;
  /** True once the stored choice has been read on the client. */
  ready: boolean;
  decide: (choices: ConsentChoices) => void;
  acceptAll: () => void;
  essentialOnly: () => void;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // SSR/SSG renders with no consent (banner absent from the HTML); the
  // stored choice applies right after hydration.
  useEffect(() => {
    setConsent(readStored());
    setReady(true);
  }, []);

  const decide = useCallback((choices: ConsentChoices) => {
    // ponytail: analytics forced false while the category is not in use —
    // store `choices.analytics` + bump CONSENT_VERSION when it ships.
    void choices;
    const state: ConsentState = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      necessary: true,
      analytics: false,
    };
    setConsent(state);
    persist(state);
  }, []);

  const acceptAll = useCallback(() => decide({ analytics: true }), [decide]);
  const essentialOnly = useCallback(() => decide({ analytics: false }), [decide]);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      ready,
      decide,
      acceptAll,
      essentialOnly,
      settingsOpen,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
    }),
    [consent, ready, decide, acceptAll, essentialOnly, settingsOpen],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used within <ConsentProvider>');
  return ctx;
}
