'use client'

import { useState, useEffect, useRef } from 'react'
import { CREDIT_PACKAGES } from '@/lib/credit-packages'

type PkgId = (typeof CREDIT_PACKAGES)[number]['id']

export default function CreditsPage() {
  const [selected, setSelected] = useState<PkgId | null>(null)
  const [paymentType, setPaymentType] = useState<'promptpay' | 'card'>('promptpay')
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [chargeId, setChargeId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const selectedPkg = CREDIT_PACKAGES.find((p) => p.id === selected)

  useEffect(() => {
    if (!chargeId || success) return

    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/payment/status?charge_id=${chargeId}`)
      const data = await res.json()
      if (data.status === 'successful') {
        clearInterval(pollRef.current!)
        setSuccess(true)
        setQrCode(null)
      } else if (data.status === 'failed' || data.status === 'expired') {
        clearInterval(pollRef.current!)
        setError('การชำระเงินล้มเหลวหรือหมดเวลา กรุณาลองใหม่')
        setQrCode(null)
        setChargeId(null)
      }
    }, 3000)

    return () => clearInterval(pollRef.current!)
  }, [chargeId, success])

  const handlePayment = async () => {
    if (!selected) return
    setLoading(true)
    setError(null)
    setQrCode(null)
    setChargeId(null)

    try {
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: selected, payment_type: paymentType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด')

      if (paymentType === 'promptpay') {
        setQrCode(data.qr_code_url)
        setChargeId(data.charge_id)
      } else {
        setSuccess(true)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const resetPayment = () => {
    setQrCode(null)
    setChargeId(null)
    setError(null)
    setSuccess(false)
    clearInterval(pollRef.current!)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">ซื้อเครดิต</h1>
        <p className="text-sm text-zinc-500">เครดิตไม่มีวันหมดอายุ — ใช้เมื่อไหร่ก็ได้</p>
      </div>

      {success && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-8 text-center mb-6">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-lg font-bold mb-1">ชำระเงินสำเร็จ!</p>
          <p className="text-sm text-zinc-500 mb-4">
            เครดิต {selectedPkg?.credits.toLocaleString()} เครดิตถูกเพิ่มเข้าบัญชีของคุณแล้ว
          </p>
          <button
            onClick={() => { resetPayment(); setSelected(null) }}
            className="text-sm font-medium underline underline-offset-2 text-zinc-500 hover:text-black"
          >
            ซื้อเพิ่ม
          </button>
        </div>
      )}

      {qrCode && !success && (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 text-center mb-6">
          <p className="font-semibold mb-1">สแกน QR Code เพื่อชำระเงิน</p>
          <p className="text-sm text-zinc-500 mb-4">
            ฿{selectedPkg?.price_thb.toLocaleString()} · เครดิตจะถูกเพิ่มอัตโนมัติหลังชำระ
          </p>
          <img src={qrCode} alt="PromptPay QR Code" className="mx-auto w-56 h-56 border border-zinc-100 rounded-lg" />
          <div className="flex items-center justify-center gap-1.5 mt-4 text-zinc-400 text-xs">
            <span className="w-3 h-3 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
            รอการยืนยันชำระเงิน... (QR หมดอายุใน 15 นาที)
          </div>
          <button onClick={resetPayment} className="mt-4 text-xs text-zinc-400 hover:text-black underline underline-offset-2">
            ยกเลิก
          </button>
        </div>
      )}

      {!success && !qrCode && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {CREDIT_PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelected(pkg.id as PkgId)}
                className={`relative border rounded-xl p-5 text-left transition-all ${
                  selected === pkg.id ? 'border-black bg-black text-white' : 'border-zinc-200 bg-white hover:border-zinc-400'
                }`}
              >
                {pkg.popular && (
                  <span className={`absolute -top-2.5 left-4 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    selected === pkg.id ? 'bg-white text-black' : 'bg-black text-white'
                  }`}>
                    ⭐ ยอดนิยม
                  </span>
                )}
                <p className={`text-sm font-semibold mb-2 ${selected === pkg.id ? 'text-zinc-300' : 'text-zinc-500'}`}>{pkg.name}</p>
                <p className="text-2xl font-bold tracking-tight">
                  {pkg.credits.toLocaleString()}
                  <span className={`text-sm font-normal ml-1 ${selected === pkg.id ? 'text-zinc-300' : 'text-zinc-500'}`}>เครดิต</span>
                </p>
                <p className={`text-lg font-semibold mt-1 ${selected === pkg.id ? 'text-white' : 'text-zinc-900'}`}>
                  ฿{pkg.price_thb.toLocaleString()}
                </p>
                <p className={`text-xs mt-1 ${selected === pkg.id ? 'text-zinc-400' : 'text-zinc-400'}`}>
                  ฿{pkg.per_credit}/เครดิต
                </p>
              </button>
            ))}
          </div>

          {selected && (
            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
              <p className="font-semibold text-sm">วิธีชำระเงิน</p>
              <div className="flex gap-2">
                {(['promptpay', 'card'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setPaymentType(type)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md border transition-colors ${
                      paymentType === type ? 'border-black bg-black text-white' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
                    }`}
                  >
                    {type === 'promptpay' ? '📱 PromptPay' : '💳 บัตรเครดิต'}
                  </button>
                ))}
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2.5">{error}</div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
                <p className="text-sm text-zinc-500">
                  รวม <span className="font-semibold text-zinc-900">฿{selectedPkg?.price_thb.toLocaleString()}</span>
                </p>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />กำลังดำเนินการ...</>
                  ) : 'ชำระเงิน →'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs text-zinc-400">
        <div><p className="text-base mb-1">♾️</p><p>ไม่หมดอายุ</p></div>
        <div><p className="text-base mb-1">🔒</p><p>ปลอดภัย 100%</p></div>
        <div><p className="text-base mb-1">⚡</p><p>เพิ่มทันที</p></div>
      </div>
    </div>
  )
}
