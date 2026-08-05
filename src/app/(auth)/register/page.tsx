'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LogoIcon } from '@/components/ui/LogoIcon'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError('ไม่สามารถสมัครได้ กรุณาลองใหม่')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-14 border-b border-zinc-200 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-sm tracking-tight">
          <LogoIcon size={24} />
          DoomLead
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[360px] text-center">
          <div className="mb-8">
            <h1 className="text-[26px] font-bold tracking-tight mb-2">สมัครใช้งานฟรี</h1>
            <p className="text-sm text-zinc-500">รับ 50 เครดิตฟรีทันที ไม่ต้องใส่บัตรเครดิต</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-md px-3 py-2.5 mb-4 text-left">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 border border-zinc-200 rounded-lg py-3 text-sm font-medium hover:bg-zinc-50 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
            ) : <GoogleIcon />}
            {loading ? 'กำลังสมัคร...' : 'สมัครด้วย Google'}
          </button>

          <div className="mt-6 space-y-1.5">
            <p className="text-xs text-zinc-400">มีบัญชีแล้ว? <Link href="/login" className="text-zinc-600 underline underline-offset-2">เข้าสู่ระบบ</Link></p>
            <p className="text-xs text-zinc-400">การสมัครถือว่าคุณยอมรับ Terms of Service</p>
          </div>
        </div>
      </div>
    </div>
  )
}
