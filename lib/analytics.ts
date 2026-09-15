import type { PostHog } from 'posthog-js';

/**
 * PostHog product analytics (EU Cloud) — one switch: NEXT_PUBLIC_POSTHOG_KEY.
 * - Unset → analytics does not exist: no consent category, no SDK, no requests.
 * - Set → the SDK (~94 KB gz) is fetched ONLY after the visitor opts in to
 *   "Analytics" (components/consent) and talks to PostHog through our own
 *   `/lumen` proxy (middleware.ts, cookies stripped), so blockers don't skew
 *   the booking funnel.
 * Disclosed in the Cookie Policy (AVX-07 v3.3 §6, content/legal/cookies-v3-3.tsx)
 * — keep that section in step with what is configured here.
 *
 * Client components only. Events carry ids/dates/amounts — never names or emails.
 */
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
export const ANALYTICS_ENABLED = Boolean(KEY);

export type EventProperties = Record<string, string | number | boolean | null>;

type Job = (posthog: PostHog) => void;

let consent: 'unknown' | 'granted' | 'denied' = 'unknown';
let client: PostHog | null = null;
let loading = false;
// Calls made before the consent cookie is read (child effects run before
// ConsentProvider's) or before the SDK chunk lands: replayed on load, dropped
// on denial.
const queue: Job[] = [];

// Analytics must never break the page it measures — least of all the Stripe redirect.
function safely(job: Job, posthog: PostHog) {
  try {
    job(posthog);
  } catch {
    // A dropped event is invisible to the visitor; a thrown one is not.
  }
}

function run(job: Job) {
  if (!ANALYTICS_ENABLED || consent === 'denied') return;
  if (client) safely(job, client);
  else if (queue.length < 50) queue.push(job);
}

export function track(event: string, properties?: EventProperties) {
  run((posthog) => posthog.capture(event, properties));
}

export function captureError(error: unknown) {
  run((posthog) => posthog.captureException(error));
}

/** Keeps the PostHog person in step with the Supabase session — the user id only. */
export function syncIdentity(userId: string | null) {
  run((posthog) => {
    if (userId) posthog.identify(userId);
    else if (posthog.get_property('$user_state') === 'identified') posthog.reset();
  });
}

/**
 * Ids left from an earlier consent (lapsed after 6 months, or withdrawn in
 * another tab) when the SDK isn't loaded to clean up after itself. Never call
 * with a live client: PostHog reads its opt-out marker from storage on every
 * capture, so removing it would switch capturing back on.
 */
function wipeStoredIds() {
  const domain = location.hostname.replace(/^www\./, '');
  for (const name of document.cookie.split(';').map((c) => c.split('=')[0].trim())) {
    if (!name.startsWith('ph_')) continue;
    document.cookie = `${name}=; max-age=0; path=/`;
    document.cookie = `${name}=; max-age=0; path=/; domain=.${domain}`;
  }
  try {
    for (const store of [localStorage, sessionStorage]) {
      for (const key of Object.keys(store)) {
        if (key.startsWith('ph_') || key.startsWith('__ph_')) store.removeItem(key);
      }
    }
  } catch {
    // Storage blocked (privacy mode) — nothing was kept there.
  }
}

export function setAnalyticsConsent(granted: boolean) {
  if (!KEY) return;
  consent = granted ? 'granted' : 'denied';

  if (!granted) {
    queue.length = 0;
    if (client) {
      // Withdrawn mid-session: nothing is sent any more, the recorder stops
      // watching the DOM, and opt_out_persistence_by_default wipes the ph_*
      // cookie + localStorage.
      // ponytail: PostHog's per-tab window id stays in sessionStorage until the
      // tab closes — never read or sent again.
      client.opt_out_capturing();
      client.stopSessionRecording();
    } else {
      wipeStoredIds();
    }
    return;
  }
  if (client) {
    client.opt_in_capturing({ captureEventName: false });
    client.startSessionRecording();
    return;
  }
  if (loading) return;
  loading = true;

  import('posthog-js')
    .then(({ default: posthog }) => {
      loading = false;
      if (consent !== 'granted') return; // revoked while the chunk was loading
      posthog.init(KEY, {
        api_host: '/lumen',
        ui_host: 'https://eu.posthog.com',
        defaults: '2026-08-30',
        capture_exceptions: true,
        opt_out_persistence_by_default: true,
        // Same lifetime as the consent it rests on (avexa_consent, 6 months).
        cookie_expiration: 180,
        // /book/confirmation?session_id=cs_… is a bearer link to a guest booking,
        // Supabase's ?code= a sign-in secret — masked in every URL, replays included.
        mask_personal_data_properties: true,
        custom_personal_data_properties: ['session_id', 'code'],
        // Clicks never carry element text (a name or an email is only a click away).
        mask_all_text: true,
        // Console lines can quote URLs and errors verbatim — keep them out of replays.
        enable_recording_console_log: false,
      });
      // A past withdrawal leaves PostHog's own opt-out marker behind — the fresh
      // consent cookie is the record of truth.
      posthog.opt_in_capturing({ captureEventName: false });
      client = posthog;
      for (const job of queue.splice(0)) safely(job, posthog);
    })
    .catch(() => {
      // Chunk failed to load (offline, deploy in flight) — the next page load retries.
      loading = false;
    });
}
