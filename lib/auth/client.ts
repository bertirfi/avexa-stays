import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/** Sign out client-side. The AuthProvider's onAuthStateChange clears the
 *  localStorage mirror and dispatches `avexa:auth-changed`. */
export async function signOutClient() {
  await getSupabaseBrowserClient().auth.signOut();
}
