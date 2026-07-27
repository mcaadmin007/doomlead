import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_balance')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar
        credits={profile?.credits_balance ?? 0}
        userEmail={user.email ?? ''}
      />
      <main className="flex-1 overflow-y-auto bg-zinc-50/50">
        {children}
      </main>
    </div>
  )
}
