import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin Client — ใช้ Service Role Key
 * ใช้เฉพาะใน Server-side (API routes, webhooks)
 * ไม่ต้องผ่าน RLS
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
