'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogoIcon } from '@/components/ui/LogoIcon'

// ── แยก component ที่ใช้ useSearchParams ออกมา ─────────────
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(urlError)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      setLoading(false)
    } else {
      router.push('/dashboard/search')
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError('ไม่สามารถเข้าสู่ระบบด้วย Google ได้ กรุณาลองใหม่')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[360px]">
        <h1 className="text-[26px] font-bold tracking-tight mb-1">เข้าสู่ระบบ</h1>
        <p className="text-sm text-zinc-500 mb-8">
          ยังไม่มีบัญชี?{' '}
          <Link href="/register" className="text-black font-medium underline underline-offset-2">
            สมัครฟรี
          </Link>
        </p>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2.5 border border-zinc-200 rounded-md py-2.5 text-sm font-medium hover:bg-zinc-50 transition-colors disabled:opacity-50 mb-4"
        >
          {googleLoading ? (
            <span className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
          )}
          เข้าสู่ระบบด้วย Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-zinc-200" />
          <span className="text-xs text-zinc-400">หรือใช้อีเมล</span>
          <div className="flex-1 h-px bg-zinc-200" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
              className="w-full border border-zinc-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full border border-zinc-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-400"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-md px-3 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-sm font-semibold py-2.5 rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ →'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Page — wrap LoginForm ด้วย Suspense ────────────────────
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-14 border-b border-zinc-200 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-sm tracking-tight">
          <LogoIcon size={24} />
          DoomLead
        </Link>
      </header>

      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><span className="text-zinc-400 text-sm">กำลังโหลด...</span></div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
