import type { Metadata } from 'next';
import { CheckoutApp } from '@/components/checkout/CheckoutApp';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your AVEXA booking.',
};

export default function CheckoutPage() {
  return (
    <div className="bg-cream pt-20 md:pt-24">
      <CheckoutApp />
    </div>
  );
}
