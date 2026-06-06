'use client';

import { useEffect, useState } from 'react';
import { clearUser, nameFromEmail, readUser, setHasTrips, writeUser } from '@/lib/booking';

/**
 * DemoModeToggle — global keyboard shortcut for client presentations.
 *
 * Press "D" anywhere on the site to flip between logged-out and logged-in
 * states (with mock trips populated). Ignored when typing in inputs.
 *
 * Shows a brief toast when the state flips.
 */
export function DemoModeToggle() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    function isEditable(el: EventTarget | null): boolean {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      return el.isContentEditable;
    }

    function flash(message: string) {
      setToast(message);
      window.setTimeout(() => setToast(null), 1800);
    }

    function emit() {
      window.dispatchEvent(new Event('avexa:auth-changed'));
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'd' && e.key !== 'D') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditable(e.target)) return;

      const user = readUser();
      if (user?.loggedIn) {
        clearUser();
        emit();
        flash('Demo: signed out');
      } else {
        const email = 'demo@avexa.com';
        const firstName = nameFromEmail(email);
        writeUser({
          loggedIn: true,
          email,
          firstName,
          name: firstName,
          method: 'demo',
        });
        setHasTrips(true);
        emit();
        flash(`Demo: signed in as ${firstName}`);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (!toast) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream shadow-lg"
    >
      {toast}
      <span className="ml-2 rounded-full bg-cream/15 px-2 py-0.5 font-mono-label text-cream/80">
        D
      </span>
    </div>
  );
}
