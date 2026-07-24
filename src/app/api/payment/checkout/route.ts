import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import omise from '@/lib/omise'
import { getPackage } from '@/lib/credit-packages'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { package_id, payment_type, token } = body

  const pkg = getPackage(package_id)
  if (!pkg) {
    return NextResponse.json({ error: 'แพ็กไม่ถูกต้อง' }, { status: 400 })
  }

  const amountSatang = pkg.price_thb * 100
  const admin = createAdminClient()

  try {
    if (payment_type === 'promptpay') {
      const source = await (omise.sources as any).create({
        amount: amountSatang,
        currency: 'THB',
        type: 'promptpay',
      })

      const charge = await (omise.charges as any).create({
        amount: amountSatang,
        currency: 'THB',
        source: source.id,
        return_uri: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?status=success`,
        metadata: {
          user_id: user.id,
          package_id,
          credits: String(pkg.credits),
        },
      })

      await admin.from('payments').insert({
        user_id: user.id,
        omise_charge_id: charge.id,
        amount_thb: pkg.price_thb,
        credits_purchased: pkg.credits,
        status: 'pending',
      })

      return NextResponse.json({
        charge_id: charge.id,
        qr_code_url: charge.source?.references?.qr_code_url ?? null,
        expires_at: charge.expires_at ?? null,
      })
    }

    if (payment_type === 'card' && token) {
      const charge = await (omise.charges as any).create({
        amount: amountSatang,
        currency: 'THB',
        card: token,
        metadata: {
          user_id: user.id,
          package_id,
          credits: String(pkg.credits),
        },
      })

      if (charge.status === 'successful') {
        await admin.from('payments').insert({
          user_id: user.id,
          omise_charge_id: charge.id,
          amount_thb: pkg.price_thb,
          credits_purchased: pkg.credits,
          status: 'success',
        })

        await admin.rpc('add_credits', {
          p_user_id: user.id,
          p_amount: pkg.credits,
          p_description: `ซื้อแพ็ก ${pkg.name} (${pkg.credits} เครดิต) — บัตรเครดิต`,
        })

        return NextResponse.json({ success: true, credits_added: pkg.credits })
      }

      return NextResponse.json({ error: 'การชำระเงินไม่สำเร็จ' }, { status: 400 })
    }

    return NextResponse.json({ error: 'payment_type ไม่ถูกต้อง' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
