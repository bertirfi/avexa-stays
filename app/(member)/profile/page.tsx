import type { Metadata } from 'next';
import { ProfileApp } from '@/components/profile/ProfileApp';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your AVEXA member profile, personal details, and preferences.',
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <ProfileApp />;
}
