import Stripe from 'stripe';

/**
 * Stripe SDK singleton — server-only.
 *
 * Lazy init: the secret is validated at call time (not import time) so builds
 * and routes that never touch Stripe don't require the env var. The module-
 * scope instance is reused across warm invocations on Vercel.
 */
let client: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  if (!client) {
    client = new Stripe(key, {
      typescript: true,
      appInfo: { name: 'avexa-stays', url: 'https://avexastays.com' },
    });
  }
  return client;
}
