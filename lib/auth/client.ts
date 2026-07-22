import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/** Sign out client-side. AuthProvider's onAuthStateChange fires and updates the
 *  useAuth() context, so consumers (Nav, sidebars, …) react automatically. */
export async function signOutClient() {
  await getSupabaseBrowserClient().auth.signOut();
}
