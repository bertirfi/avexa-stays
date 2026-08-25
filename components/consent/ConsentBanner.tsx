'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Icon } from '@/components/Icon';
import { cn } from '@/lib/cn';
import { useConsent } from '@/components/consent/ConsentProvider';

/**
 * First-visit cookie banner (bottom sheet) + the granular settings modal.
 * Mounted once in the root layout; renders nothing during SSR and until the
 * stored choice has been read — no flash, no static-rendering impact.
 * The banner never blocks the page: no backdrop, no scroll lock.
 */
export function ConsentBanner() {
  const { consent, ready, acceptAll, essentialOnly, settingsOpen, openSettings } = useConsent();
  const reduceMotion = useReducedMotion();

  const showBanner = ready && consent === null && !settingsOpen;

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.aside
            role="region"
            aria-label="Cookie consent"
            initial={reduceMotion ? { opacity: 0 } : { y: 96, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: 96, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[200] p-4 sm:p-6"
          >
            <div className="pointer-events-auto mx-auto w-full max-w-[720px] rounded-[20px] border border-cream/10 bg-ink text-cream shadow-[0_24px_60px_-12px_rgba(0,0,0,0.55)]">
              <div className="p-6 md:p-7">
                <p className="font-mono-label text-gold">Cookies &amp; privacy</p>
                <h2 className="mt-2 font-display text-xl text-cream md:text-2xl">
                  Your visit, your choice.
                </h2>
                <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-cream/75">
                  <span className="block">
                    We only set what the site needs to work — sign-in, your booking, your preferences.
                  </span>
                  <span className="block">
                    No advertising, no tracking, and analytics only ever with your consent.
                  </span>
                  <span className="block">
                    Full details in our{' '}
                    <Link href="/cookies" className="underline underline-offset-2 transition hover:text-gold">
                      Cookie Policy
                    </Link>
                    .
                  </span>
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  {/* Equal choice: same size, same shape, both solid — no dark patterns. */}
                  <button
                    type="button"
                    onClick={acceptAll}
                    className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold/90"
                  >
                    Accept all
                  </button>
                  <button
                    type="button"
                    onClick={essentialOnly}
                    className="rounded-full bg-cream px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
                  >
                    Only essential
                  </button>
                  <button
                    type="button"
                    onClick={openSettings}
                    className="py-3 text-sm font-medium text-cream/75 underline underline-offset-4 transition hover:text-gold sm:ml-auto"
                  >
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {settingsOpen && <ConsentSettingsModal />}
    </>
  );
}

/** Granular per-category settings — also reopened via the footer's "Cookie preferences". */
function ConsentSettingsModal() {
  const { decide, essentialOnly, closeSettings } = useConsent();

  // Escape closes + body scroll lock while open (same pattern as FiltersModal).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSettings();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [closeSettings]);

  const save = () => {
    decide({ analytics: false });
    closeSettings();
  };

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close cookie settings"
        onClick={closeSettings}
        className="absolute inset-0 bg-ink/50"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cookie settings"
        className="relative flex max-h-[85vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.4)]"
      >
        <div className="flex items-center justify-between border-b border-gray-line px-6 py-4">
          <h2 className="font-display text-lg">Cookie settings</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={closeSettings}
            className="grid size-8 place-items-center rounded-full bg-gray-light text-ink transition hover:bg-gray-line"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <CategoryRow
            title="Strictly necessary"
            badge="Always on"
            description="Sign-in cookies (Supabase), your consent choice, and the search, currency and booking preferences saved in your browser. Payment happens on Stripe's own secure page."
            checked
            disabled
          />
          <CategoryRow
            title="Analytics"
            badge="Not in use yet"
            description="We run no analytics today. If we ever add it, we will ask you first."
            checked={false}
            disabled
          />
          <p className="text-xs text-ink-60">
            <span className="block">
              The maps on our pages come from Google Maps, which sets its own cookies.
            </span>
            <span className="block">Your choice is kept for 6 months, then we ask again.</span>
            <span className="block">
              Details in our{' '}
              <Link href="/cookies" className="underline underline-offset-2 hover:text-ink">
                Cookie Policy
              </Link>
              .
            </span>
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-line px-6 py-4">
          <button
            type="button"
            onClick={() => {
              essentialOnly();
              closeSettings();
            }}
            className="rounded-full border border-ink px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-cream"
          >
            Only essential
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-ink/90"
          >
            Save choices
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({
  title,
  description,
  badge,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  badge?: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-card-sm border border-gray-line p-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
          {badge && <span className="font-mono-label text-gold-dark">{badge}</span>}
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-60">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition',
          checked ? 'bg-gold' : 'bg-gray-line',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </div>
  );
}
