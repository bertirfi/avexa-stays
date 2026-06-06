import type { Metadata } from 'next';
import { MemberHero } from '@/components/member-benefits/MemberHero';
import { MemberStatement } from '@/components/member-benefits/MemberStatement';
import { MemberPerks } from '@/components/member-benefits/MemberPerks';
import { MemberReward } from '@/components/member-benefits/MemberReward';
import { MemberCompare } from '@/components/member-benefits/MemberCompare';
import { MemberJoin } from '@/components/member-benefits/MemberJoin';
import { MemberFAQ } from '@/components/member-benefits/MemberFAQ';
import { MemberCTA } from '@/components/member-benefits/MemberCTA';

export const metadata: Metadata = {
  title: 'Member Benefits',
  description:
    'Free to join, free forever. Every AVEXA member gets the lowest rate we offer — 15% off every booking, 25% off long stays, free cancellation, early check-in, late check-out, and a welcome package on every stay.',
};

export default function MemberBenefitsPage() {
  return (
    <>
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
