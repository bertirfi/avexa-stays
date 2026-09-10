import type { Metadata } from 'next';
import { CheckoutApp } from '@/components/checkout/CheckoutApp';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your AVEXA booking.',
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // Identity from the server-side session. Signed in → member checkout with
  // contact prefill. Signed out → guest checkout (client decision 04.09): the
  // app shows the "Sign in / Join free" vs "Continue as guest" gate. The money
  // gate is /api/checkout, which re-derives member vs guest from the session.
  const {
    data: { user },
  } = await (await getSupabaseServerClient()).auth.getUser();
  if (!user) {
    return (
      <div className="bg-cream pt-20 md:pt-24">
        <CheckoutApp initialContact={{ fullName: '', email: '' }} guest />
      </div>
    );
  }
  const fullName = (user.user_metadata?.full_name as string | undefined)?.trim() ?? '';
  const email = user.email ?? '';
  return (
    <div className="bg-cream pt-20 md:pt-24">
      <CheckoutApp initialContact={{ fullName, email }} />
    </div>
  );
}
