import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import Sidebar from '@/components/dashboard/Sidebar'
import { ensureProfile } from '@/lib/supabase/profile'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('credits_balance')
    .eq('id', user.id)
    .maybeSingle()

  const profile = existingProfile ?? await ensureProfile(user.id)

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar
        credits={profile?.credits_balance ?? 0}
        userEmail={user.email}
      />
      <main className="flex-1 overflow-y-auto bg-zinc-50/50">
        {children}
      </main>
    </div>
  )
}
