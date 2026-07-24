import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const jobId = request.nextUrl.searchParams.get('job_id')
  if (!jobId) {
    return NextResponse.json({ error: 'Missing job_id' }, { status: 400 })
  }

  // ตรวจสอบว่า job เป็นของ user
  const { data: job } = await supabase
    .from('scrape_jobs')
    .select('*, job_results(*)')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .single()

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  // สร้าง Excel rows
  const rows = (job.job_results ?? []).map((r: Record<string, unknown>, i: number) => ({
    '#': i + 1,
    'ชื่อธุรกิจ': r.name ?? '',
    'ที่อยู่': r.address ?? '',
    'เบอร์โทร': r.phone ?? '',
    'เว็บไซต์': r.website ?? '',
    'อีเมล': r.email ?? '',
    'เรตติ้ง': r.rating ?? '',
    'จำนวนรีวิว': r.reviews_count ?? '',
    'หมวดหมู่': r.category ?? '',
    'Latitude': r.lat ?? '',
    'Longitude': r.lng ?? '',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)

  // ปรับ column width อัตโนมัติ
  ws['!cols'] = [
    { wch: 4 }, { wch: 30 }, { wch: 40 }, { wch: 16 },
    { wch: 30 }, { wch: 28 }, { wch: 8 }, { wch: 12 },
    { wch: 20 }, { wch: 12 }, { wch: 12 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Leads')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const filename = `doomlead-${job.query}-${job.location}.xlsx`

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  })
}
