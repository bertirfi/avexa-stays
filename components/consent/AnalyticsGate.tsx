'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useConsent } from '@/components/consent/ConsentProvider';
import { setAnalyticsConsent, syncIdentity } from '@/lib/analytics';

/**
 * Wires PostHog (lib/analytics.ts) to the visitor's Analytics consent and to
 * the Supabase session. No choice yet counts as "no". Renders nothing.
 */
export function AnalyticsGate() {
  const { consent, ready } = useConsent();
  const { user, loading } = useAuth();
  const granted = consent?.analytics === true;
  const userId = user?.id ?? null;

  useEffect(() => {
    if (ready) setAnalyticsConsent(granted);
  }, [ready, granted]);

  // Re-runs when consent flips to granted: a denial empties the queue, so an
  // identity queued before the choice would otherwise be lost for this visit.
  useEffect(() => {
    if (!loading && granted) syncIdentity(userId);
  }, [loading, userId, granted]);

  return null;
}
