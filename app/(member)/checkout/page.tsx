import type { Metadata } from 'next';
import { CheckoutApp } from '@/components/checkout/CheckoutApp';
import { requireUser } from '@/lib/auth/server';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your AVEXA booking.',
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // Members only — the server-side session check IS the gate (anonymous
  // visitors are redirected to /login). Contact prefill comes from the session.
  const user = await requireUser('/checkout');
  const fullName = (user.user_metadata?.full_name as string | undefined)?.trim() ?? '';
  const email = user.email ?? '';
  return (
    <div className="bg-cream pt-20 md:pt-24">
      <CheckoutApp initialContact={{ fullName, email }} />
    </div>
  );
}
