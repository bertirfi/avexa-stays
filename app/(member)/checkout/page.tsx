import type { Metadata } from 'next';
import { CheckoutApp } from '@/components/checkout/CheckoutApp';
import { requireUser } from '@/lib/auth/server';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your AVEXA booking.',
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // Members only — real gate is this server-side session check; the client
  // AuthGate below is just the friendly UX for the same rule.
  await requireUser('/checkout');
  return (
    <div className="bg-cream pt-20 md:pt-24">
      <CheckoutApp />
    </div>
  );
}
