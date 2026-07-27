import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

export const NEW_MEMBER_CREDITS = 50

/**
 * Authentication normally creates the profile through a database trigger.
 * This fallback makes the application resilient if that trigger is delayed or
 * missing. The database column also defaults credits_balance to 50.
 */
export async function ensureProfile(userId: string) {
  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('profiles')
    .select('credits_balance')
    .eq('id', userId)
    .maybeSingle()

  if (existing) return existing

  const { data: created, error } = await admin
    .from('profiles')
    .insert({ id: userId, credits_balance: NEW_MEMBER_CREDITS })
    .select('credits_balance')
    .single()

  if (!error && created) return created

  // A concurrent request or auth trigger may have inserted the row first.
  const { data: concurrentProfile } = await admin
    .from('profiles')
    .select('credits_balance')
    .eq('id', userId)
    .single()

  return concurrentProfile
}
