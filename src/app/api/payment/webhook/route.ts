import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/payment/webhook
 * รับ event จาก Omise Dashboard
 * ต้อง config Webhook URL ใน Omise Dashboard:
 *   https://your-domain.com/api/payment/webhook
 *
 * Events ที่ handle:
 *   - charge.complete (PromptPay สำเร็จ)
 */
export async function POST(request: NextRequest) {
  const body = await request.json()

  // ── charge.complete → PromptPay paid ─────────────────────
  if (body.key === 'charge.complete') {
    const charge = body.data

    if (charge.status !== 'successful') {
      // payment failed/expired → update record
      if (charge.id) {
        const admin = createAdminClient()
        await admin
          .from('payments')
          .update({ status: 'failed' })
          .eq('omise_charge_id', charge.id)
      }
      return NextResponse.json({ ok: true })
    }

    const { user_id, credits } = charge.metadata ?? {}
    if (!user_id || !credits) {
      console.error('[webhook] missing metadata:', charge.id)
      return NextResponse.json({ ok: true })
    }

    const admin = createAdminClient()

    // ป้องกัน duplicate (idempotency)
    const { data: existing } = await admin
      .from('payments')
      .select('status')
      .eq('omise_charge_id', charge.id)
      .single()

    if (existing?.status === 'success') {
      return NextResponse.json({ ok: true }) // already processed
    }

    // อัปเดต payment → success
    await admin
      .from('payments')
      .update({ status: 'success' })
      .eq('omise_charge_id', charge.id)

    // เพิ่มเครดิต (atomic via RPC)
    const { error } = await admin.rpc('add_credits', {
      p_user_id: user_id,
      p_amount: parseInt(credits, 10),
      p_description: `ชำระผ่าน PromptPay (charge: ${charge.id})`,
    })

    if (error) {
      console.error('[webhook] add_credits failed:', error)
    }
  }

  return NextResponse.json({ ok: true })
}
