import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/auth/logout
 * Sign out user + clear session start cookie
 * เรียกจาก middleware เมื่อ session เกิน 24 ชั่วโมง
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch { /* ignore */ }

  const response = NextResponse.redirect(new URL('/login', request.url))
  response.cookies.delete('dl_session_start')
  return response
}
