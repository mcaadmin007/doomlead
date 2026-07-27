import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { searchGoogleMaps, ENRICHMENT_PACKS, type EnrichmentPack, type OutscraperResult } from '@/lib/outscraper'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { query, location, count, pack = 'basic' } = body as {
    query: string
    location: string
    count: number
    pack: EnrichmentPack
  }

  if (!query || !location || !count) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 })
  }

  const packInfo = ENRICHMENT_PACKS[pack]
  const creditsNeeded = count * packInfo.credits_per_result

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

  const admin = createAdminClient()

  // สร้าง job
  const { data: job, error: jobError } = await admin
    .from('scrape_jobs')
    .insert({
      user_id: user.id,
      query,
      location,
      count_requested: count,
      include_email: pack === 'cold_email',
      credits_used: creditsNeeded,
      status: 'processing',
    })
    .select()
    .single()

  if (jobError || !job) {
    return NextResponse.json({ error: 'ไม่สามารถสร้าง job ได้' }, { status: 500 })
  }

  try {
    // ── เรียก Outscraper API ──────────────────────────────────
    const rawResults = await searchGoogleMaps({
      query,
      location,
      limit: count,
      pack,
      plainQuery: true,
    })

    // ── Map ผลลัพธ์ ───────────────────────────────────────────
    const mappedResults = rawResults.slice(0, count).map((r: OutscraperResult) => ({
      job_id: job.id,
      name:              r.name             ?? null,
      phone:             r.phone            ?? null,
      website:           r.website          ?? null,
      address:           r.address          ?? null,
      email:             r.email            ?? null,
      rating:            r.rating           ?? null,
      reviews_count:     r.reviews          ?? null,
      category:          r.category         ?? r.subtypes ?? null,
      lat:               r.latitude         ?? null,
      lng:               r.longitude        ?? null,
      subtypes:          r.subtypes         ?? null,
      business_status:   r.business_status  ?? null,
      full_name:         r.full_name        ?? null,
      first_name:        r.first_name       ?? null,
      last_name:         r.last_name        ?? null,
      title:             r.title            ?? null,
      contact_phone:     r.contact_phone    ?? null,
      contact_linkedin:  r.contact_linkedin ?? null,
      contact_facebook:  r.contact_facebook ?? null,
      contact_instagram: r.contact_instagram ?? null,
      domain:            r.domain           ?? null,
      company_linkedin:  r.company_linkedin ?? null,
      company_facebook:  r.company_facebook ?? null,
      company_instagram: r.company_instagram ?? null,
      company_x:         r.company_x        ?? null,
      company_youtube:   r.company_youtube  ?? null,
      street:            r.street           ?? null,
      city:              r.city             ?? null,
      state:             r.state            ?? null,
      postal_code:       r.postal_code      ?? null,
      country:           r.country          ?? null,
      time_zone:         r.time_zone        ?? null,
      plus_code:         r.plus_code        ?? null,
      photos_count:      r.photos_count     ?? null,
      photo:             r.photo            ?? null,
      logo:              r.logo             ?? null,
      reviews_link:      r.reviews_link     ?? null,
      place_id:          r.place_id         ?? null,
      google_id:         r.google_id        ?? null,
      description:       r.description      ?? null,
      working_hours:     r.working_hours
        ? (typeof r.working_hours === 'string' ? r.working_hours : JSON.stringify(r.working_hours))
        : null,
      verified:          r.verified         ?? null,
      raw_data:          r,
    }))

    // ── บันทึก results ────────────────────────────────────────
    if (mappedResults.length > 0) {
      await admin.from('job_results').insert(mappedResults)
    }

    // ── หัก credit ────────────────────────────────────────────
    const actualCredits = mappedResults.length * packInfo.credits_per_result
    await admin.rpc('add_credits', {
      p_user_id: user.id,
      p_amount: -actualCredits,
      p_description: `ค้นหา "${query} ${location}" · ${packInfo.label} (${mappedResults.length} รายชื่อ)`,
    })

    // ── อัปเดต job ────────────────────────────────────────────
    await admin
      .from('scrape_jobs')
      .update({
        status: 'done',
        count_returned: mappedResults.length,
        credits_used: actualCredits,
      })
      .eq('id', job.id)

    return NextResponse.json({
      job_id: job.id,
      results: mappedResults,
      credits_used: actualCredits,
    })

  } catch (err: unknown) {
    await admin
      .from('scrape_jobs')
      .update({ status: 'failed' })
      .eq('id', job.id)

    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
