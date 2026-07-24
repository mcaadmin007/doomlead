import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import omise from '@/lib/omise'

/**
 * GET /api/payment/status?charge_id=chrg_xxx
 * ใช้ poll สถานะ PromptPay จาก frontend ทุก 3 วินาที
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const chargeId = request.nextUrl.searchParams.get('charge_id')
  if (!chargeId) {
    return NextResponse.json({ error: 'Missing charge_id' }, { status: 400 })
  }

  try {
    const charge = await (omise.charges as any).retrieve(chargeId)

    // ตรวจสอบว่า charge นี้เป็นของ user คนนี้
    if (charge.metadata?.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ status: charge.status })
  } catch {
    return NextResponse.json({ error: 'ไม่พบรายการชำระเงิน' }, { status: 404 })
  }
}
