import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { query, location, count, include_email } = body

  if (!query || !location || !count) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 })
  }

  // คำนวณ credit ที่ต้องใช้
  const creditsNeeded: number = count * (include_email ? 2 : 1)

  // ตรวจสอบ credit คงเหลือ
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_balance')
    .eq('id', user.id)
    .single()

  if (!profile || profile.credits_balance < creditsNeeded) {
    return NextResponse.json(
      { error: `เครดิตไม่เพียงพอ (ต้องการ ${creditsNeeded} มีอยู่ ${profile?.credits_balance ?? 0})` },
      { status: 400 }
    )
  }

  // สร้าง job
  const { data: job, error: jobError } = await supabase
    .from('scrape_jobs')
    .insert({
      user_id: user.id,
      query,
      location,
      count_requested: count,
      include_email,
      credits_used: creditsNeeded,
      status: 'processing',
    })
    .select()
    .single()

  if (jobError || !job) {
    return NextResponse.json({ error: 'ไม่สามารถสร้าง job ได้' }, { status: 500 })
  }

  // ── Sprint 2: Call Outscraper API ──
  // const results = await callOutscraper({ query, location, count, include_email })
  // for now return empty
  const results: never[] = []

  // อัปเดต job status
  await supabase
    .from('scrape_jobs')
    .update({ status: 'done', count_returned: results.length })
    .eq('id', job.id)

  return NextResponse.json({
    job_id: job.id,
    results,
    credits_used: creditsNeeded,
  })
}
