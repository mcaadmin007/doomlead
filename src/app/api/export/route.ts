import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

const EXPORT_COLUMNS = [
  { key: 'name', label: 'ชื่อธุรกิจ' }, { key: 'category', label: 'ประเภทธุรกิจ' },
  { key: 'subtypes', label: 'ประเภทย่อย' }, { key: 'business_status', label: 'สถานะธุรกิจ' },
  { key: 'phone', label: 'เบอร์โทร' }, { key: 'website', label: 'เว็บไซต์' },
  { key: 'domain', label: 'โดเมน' }, { key: 'email', label: 'อีเมล' },
  { key: 'full_name', label: 'ชื่อผู้ติดต่อ' }, { key: 'first_name', label: 'ชื่อ' },
  { key: 'last_name', label: 'นามสกุล' }, { key: 'title', label: 'ตำแหน่ง' },
  { key: 'contact_phone', label: 'เบอร์ผู้ติดต่อ' },
  { key: 'contact_linkedin', label: 'LinkedIn ผู้ติดต่อ' },
  { key: 'contact_facebook', label: 'Facebook ผู้ติดต่อ' },
  { key: 'contact_instagram', label: 'Instagram ผู้ติดต่อ' },
  { key: 'address', label: 'ที่อยู่เต็ม' }, { key: 'street', label: 'ถนน' },
  { key: 'city', label: 'เมือง' }, { key: 'state', label: 'จังหวัด' },
  { key: 'postal_code', label: 'รหัสไปรษณีย์' }, { key: 'country', label: 'ประเทศ' },
  { key: 'lat', label: 'Latitude' }, { key: 'lng', label: 'Longitude' },
  { key: 'plus_code', label: 'Plus Code' }, { key: 'rating', label: 'เรตติ้ง' },
  { key: 'reviews_count', label: 'จำนวนรีวิว' }, { key: 'reviews_link', label: 'ลิงก์รีวิว' },
  { key: 'company_linkedin', label: 'LinkedIn บริษัท' },
  { key: 'company_facebook', label: 'Facebook บริษัท' },
  { key: 'company_instagram', label: 'Instagram บริษัท' },
  { key: 'company_x', label: 'X บริษัท' }, { key: 'company_youtube', label: 'YouTube บริษัท' },
  { key: 'photos_count', label: 'จำนวนรูป' }, { key: 'photo', label: 'รูปหลัก' },
  { key: 'logo', label: 'โลโก้' }, { key: 'description', label: 'คำอธิบาย' },
  { key: 'working_hours', label: 'เวลาทำการ' }, { key: 'time_zone', label: 'Time Zone' },
  { key: 'verified', label: 'Verified' }, { key: 'place_id', label: 'Place ID' },
  { key: 'google_id', label: 'Google ID' },
]

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const jobId = request.nextUrl.searchParams.get('job_id')
  if (!jobId) return NextResponse.json({ error: 'Missing job_id' }, { status: 400 })

  const { data: job } = await supabase
    .from('scrape_jobs').select('*, job_results(*)')
    .eq('id', jobId).eq('user_id', user.id).single()

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  const rows = (job.job_results ?? []).map((r: Record<string, unknown>, i: number) => {
    const row: Record<string, unknown> = { '#': i + 1 }
    EXPORT_COLUMNS.forEach(col => { row[col.label] = r[col.key] ?? '' })
    return row
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [{ wch: 4 }, { wch: 30 }, ...Array(EXPORT_COLUMNS.length - 1).fill({ wch: 18 })]

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
