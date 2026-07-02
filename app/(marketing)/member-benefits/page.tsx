import type { Metadata } from 'next';
import { MemberHero } from '@/components/member-benefits/MemberHero';
import { MemberStatement } from '@/components/member-benefits/MemberStatement';
import { MemberPerks } from '@/components/member-benefits/MemberPerks';
import { MemberReward } from '@/components/member-benefits/MemberReward';
import { MemberCompare } from '@/components/member-benefits/MemberCompare';
import { MemberJoin } from '@/components/member-benefits/MemberJoin';
import { MemberFAQ, faqs } from '@/components/member-benefits/MemberFAQ';
import { MemberCTA } from '@/components/member-benefits/MemberCTA';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Member Benefits',
  description:
    'Free to join, free forever. Members get our lowest rate — 15% off every booking, 25% off long stays — plus free cancellation and early check-in.',
  alternates: { canonical: '/member-benefits' },
};

// FAQPage built from the SAME data the page renders, so schema matches visible text.
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function MemberBenefitsPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <MemberHero />
      <MemberStatement />
      <MemberPerks />
      <MemberReward />
      <MemberCompare />
      <MemberJoin />
      <MemberFAQ />
      <MemberCTA />
    </>
  );
}
