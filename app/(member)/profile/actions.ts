'use server';

import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Persist the parts of a profile that live in our `profiles` row (phone +
 * marketing consent). full_name is NOT here — it stays a client-side
 * auth.updateUser so USER_UPDATED fires and the Nav's useAuth() refreshes.
 *
 * Trust boundary (api-validation rule): input is Zod-validated and identity is
 * derived from the SESSION server client, never from the caller. The write is
 * scoped to `id = user.id`; RLS (profiles_update_own) enforces ownership.
 */

const InputSchema = z.object({
  phone: z
    .string()
    .trim()
    .max(32)
    .regex(/^[+0-9 ()\-.]*$/, 'digits, spaces and + ( ) - . only')
    .or(z.literal('')),
  marketingConsent: z.boolean(),
});

export type UpdateProfileInput = z.infer<typeof InputSchema>;
export type UpdateProfileResult = { ok: true } | { error: string };

export async function updateProfile(input: UpdateProfileInput): Promise<UpdateProfileResult> {
  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not signed in' };
  }

  const { phone, marketingConsent } = parsed.data;
  const { error } = await supabase
    .from('profiles')
    .update({ phone: phone || null, marketing_consent: marketingConsent })
    .eq('id', user.id);

  if (error) {
    return { error: 'Could not save your changes' };
  }

  return { ok: true };
}
