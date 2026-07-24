'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogoIcon } from '@/components/ui/LogoIcon'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  // ── Google OAuth Register ────────────────────────────────────
  const handleGoogleRegister = async () => {
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
      setError('ไม่สามารถสมัครด้วย Google ได้ กรุณาลองใหม่')
      setGoogleLoading(false)
    }
  }

  // ── Email + Password Register → ส่ง OTP ────────────────────
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Supabase จะส่ง OTP ไปที่อีเมลนี้
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // แสดง OTP verify page
      setPendingEmail(email)
      setLoading(false)
    }
  }

  // ── รอยืนยัน OTP ────────────────────────────────────────────
  if (pendingEmail) {
    return <OTPVerifyInline email={pendingEmail} onBack={() => setPendingEmail(null)} />
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-zinc-200 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-sm tracking-tight">
          <LogoIcon size={24} />
          DoomLead
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[360px]">
          <h1 className="text-[26px] font-bold tracking-tight mb-1">สมัครใช้งานฟรี</h1>
          <p className="text-sm text-zinc-500 mb-8">
            มีบัญชีแล้ว?{' '}
            <Link href="/login" className="text-black font-medium underline underline-offset-2">
              เข้าสู่ระบบ
            </Link>
          </p>

          {/* Google Button */}
          <button
            onClick={handleGoogleRegister}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2.5 border border-zinc-200 rounded-md py-2.5 text-sm font-medium hover:bg-zinc-50 transition-colors disabled:opacity-50 mb-4"
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
              </svg>
            )}
            สมัครด้วย Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-zinc-200" />
            <span className="text-xs text-zinc-400">หรือใช้อีเมล</span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailRegister} className="space-y-4">
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
                minLength={6}
                placeholder="อย่างน้อย 6 ตัวอักษร"
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
              {loading ? 'กำลังสมัคร...' : 'สมัครฟรี →'}
            </button>

            <p className="text-xs text-zinc-400 text-center">
              การสมัครถือว่าคุณยอมรับ Terms of Service ของเรา
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── OTP Inline Component ────────────────────────────────────────
function OTPVerifyInline({ email, onBack }: { email: string; onBack: () => void }) {
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resent, setResent] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: 'signup',
    })

    if (error) {
      setError('รหัส OTP ไม่ถูกต้องหรือหมดอายุ กรุณาลองใหม่')
      setLoading(false)
    } else {
      router.push('/dashboard/search')
      router.refresh()
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError(null)

    const supabase = createClient()
    await supabase.auth.resend({ type: 'signup', email })

    setResending(false)
    setResent(true)
    setTimeout(() => setResent(false), 5000)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-14 border-b border-zinc-200 flex items-center px-6">
        <span className="flex items-center gap-2 font-bold text-sm tracking-tight">
          <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2" fill="white" stroke="none" />
            </svg>
          </div>
          DoomLead
        </span>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[360px]">
          <div className="text-3xl mb-4">📬</div>
          <h1 className="text-[22px] font-bold tracking-tight mb-2">ยืนยันอีเมลของคุณ</h1>
          <p className="text-sm text-zinc-500 mb-6">
            เราส่งรหัส 6 หลักไปที่{' '}
            <span className="font-medium text-zinc-800">{email}</span>
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">รหัส OTP</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                placeholder="000000"
                className="w-full border border-zinc-200 rounded-md px-3 py-2.5 text-sm text-center tracking-[0.3em] font-mono text-lg outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-300 placeholder:tracking-normal"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-md px-3 py-2.5">
                {error}
              </div>
            )}

            {resent && (
              <div className="bg-zinc-50 border border-zinc-200 text-zinc-600 text-sm rounded-md px-3 py-2.5">
                ✅ ส่งรหัสใหม่แล้ว — กรุณาตรวจอีเมล
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-black text-white text-sm font-semibold py-2.5 rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {loading ? 'กำลังยืนยัน...' : 'ยืนยัน →'}
            </button>
          </form>

          <div className="flex items-center justify-between mt-4 text-sm">
            <button
              onClick={onBack}
              className="text-zinc-400 hover:text-black transition-colors"
            >
              ← แก้ไขอีเมล
            </button>
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-zinc-500 hover:text-black transition-colors disabled:opacity-50"
            >
              {resending ? 'กำลังส่ง...' : 'ส่งรหัสใหม่'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
