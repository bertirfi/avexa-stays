import type { Metadata } from 'next';
import { ProfileApp } from '@/components/profile/ProfileApp';
import { requireUser } from '@/lib/auth/server';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your AVEXA member profile, personal details, and preferences.',
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  await requireUser('/profile');
  return <ProfileApp />;
}
