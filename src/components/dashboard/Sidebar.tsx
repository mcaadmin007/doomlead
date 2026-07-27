'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogoIcon } from '@/components/ui/LogoIcon'

interface SidebarProps {
  credits: number
  userEmail: string
}

const NAV_ITEMS = [
  {
    href: '/dashboard/search',
    label: 'ค้นหา Leads',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/history',
    label: 'ประวัติการค้นหา',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/credits',
    label: 'ซื้อเครดิต',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
]

export default function Sidebar({ credits, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-56 border-r border-zinc-200 flex flex-col h-full shrink-0 bg-white">
      {/* Logo */}
      <div className="h-14 border-b border-zinc-200 flex items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-sm tracking-tight">
          <LogoIcon size={26}/>
          DoomLead
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active ? 'bg-black text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`}>
              <span className={active ? 'text-white' : 'text-zinc-400'}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Credits + User */}
      <div className="border-t border-zinc-200 p-3 space-y-3">
        <Link href="/dashboard/credits"
          className="block bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-3 hover:bg-zinc-100 transition-colors">
          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide mb-0.5">เครดิตคงเหลือ</p>
          <p className="text-xl font-bold tracking-tight text-zinc-900">{credits.toLocaleString()}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">คลิกเพื่อเติมเครดิต →</p>
        </Link>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-zinc-400 truncate">{userEmail}</p>
          <button onClick={handleLogout}
            className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors whitespace-nowrap">
            ออกจากระบบ
          </button>
        </div>
      </div>
    </aside>
  )
}
