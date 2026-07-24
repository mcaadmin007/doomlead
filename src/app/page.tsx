import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LandingPage from './(marketing)/page'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ถ้า login อยู่แล้ว → ไป dashboard
  if (user) {
    redirect('/dashboard/search')
  }

  // ถ้ายังไม่ login → แสดง landing page
  return <LandingPage />
}
