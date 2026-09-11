import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalShell } from '@/components/legal/LegalShell';
import { ExtraServicesV3_2 } from '@/content/legal/extra-services-v3-2';

export const metadata: Metadata = {
  title: 'Extra Services & Tariffs',
  description: 'Everything you can add to your stay, and what it costs — AVEXA Stays Extra Services & Tariffs, AVX-08 v3.2, in force 1 September 2026.',
  alternates: { canonical: '/extra-services' },
};

export default function ExtraServicesPage() {
  return (
    <LegalShell title="Extra Services & Tariffs" code="AVX-08" version="3.2" inForce="1 September 2026">
      <ExtraServicesV3_2 />
      {/* Product CTA — not part of the legal document, kept clearly separate. */}
      <div className="mt-12 rounded-lg border border-gold/30 bg-gold/5 px-5 py-5 text-center">
        <p className="mb-3">Add extras when you book, or later from My Trips.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/locations" className="font-semibold text-gold-dark underline underline-offset-2">
            Browse locations
          </Link>
          <Link href="/my-trips" className="font-semibold text-gold-dark underline underline-offset-2">
            Go to My Trips
          </Link>
        </div>
      </div>
    </LegalShell>
  );
}
