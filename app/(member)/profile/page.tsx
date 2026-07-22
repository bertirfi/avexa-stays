import type { Metadata } from 'next';
import { ProfileApp } from '@/components/profile/ProfileApp';
import { requireUser } from '@/lib/auth/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your AVEXA member profile, personal details, and preferences.',
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const user = await requireUser('/profile');

  // Session-scoped client (RLS restricts profiles to the owner).
  const supabase = await getSupabaseServerClient();
  const { data: row } = await supabase
    .from('profiles')
    .select('phone, marketing_consent')
    .eq('id', user.id)
    .maybeSingle();

  const fullName = (user.user_metadata?.full_name as string | undefined)?.trim() ?? '';

  return (
    <ProfileApp
      initialProfile={{
        email: user.email ?? '',
        fullName,
        phone: row?.phone ?? '',
        marketingConsent: row?.marketing_consent ?? false,
      }}
    />
  );
}
