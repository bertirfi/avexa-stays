'use client';

import { useConsent } from '@/components/consent/ConsentProvider';

/** Footer legal link that reopens the cookie settings modal (revocable consent). */
export function CookiePreferencesLink({ className }: { className?: string }) {
  const { openSettings } = useConsent();
  return (
    <button type="button" onClick={openSettings} className={className}>
      Cookie preferences
    </button>
  );
}
