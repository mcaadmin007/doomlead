import 'server-only'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

/**
 * Verified current-user claims, memoized for the duration of one server render.
 * Layouts and pages can share this without making duplicate auth requests.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (error || !claims?.sub) return null

  return {
    id: claims.sub,
    email: typeof claims.email === 'string' ? claims.email : '',
  }
})
