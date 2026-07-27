const BASE_URL = 'https://api.app.outscraper.com'

export type EnrichmentPack = 'basic' | 'cold_calling' | 'cold_email'

export const ENRICHMENT_PACKS: Record<EnrichmentPack, {
  label: string
  description: string
  includes: string[]
  credits_per_result: number
  badge: string
}> = {
  basic: {
    label: 'ข้อมูลพื้นฐาน',
    description: 'ข้อมูล Google Maps มาตรฐาน',
    badge: '1 เครดิต/รายชื่อ',
    includes: [
      'ชื่อธุรกิจ',
      'เบอร์โทรหลัก',
      'เว็บไซต์',
      'ที่อยู่เต็ม (ถนน เมือง จังหวัด รหัสไปรษณีย์)',
      'เรตติ้ง + จำนวนรีวิว',
      'หมวดหมู่ธุรกิจ',
      'พิกัด GPS (Latitude / Longitude)',
      'สถานะธุรกิจ (เปิด/ปิด)',
      'วันเวลาทำการ',
    ],
    credits_per_result: 1,
  },
  cold_calling: {
    label: 'Cold Calling Pack',
    description: 'เหมาะสำหรับทีมโทรหาลูกค้า',
    badge: '2 เครดิต/รายชื่อ',
    includes: [
      'ทุกอย่างจาก Basic',
      'Phone Numbers Enricher (เบอร์โทรเพิ่มเติม)',
      'Company Insights (ข้อมูลเชิงลึกบริษัท)',
      'LinkedIn บริษัท',
      'Facebook บริษัท',
      'Instagram บริษัท',
      'X (Twitter) บริษัท',
      'YouTube บริษัท',
      'โดเมน + ชื่อบริษัททางการ',
      'รูปภาพธุรกิจ + โลโก้',
    ],
    credits_per_result: 2,
  },
  cold_email: {
    label: 'Cold Email Pack',
    description: 'เหมาะสำหรับ Email Outreach',
    badge: '3 เครดิต/รายชื่อ',
    includes: [
      'ทุกอย่างจาก Cold Calling',
      'Email Address (อีเมลบริษัท)',
      'Email Verifier (ยืนยันความถูกต้องของอีเมล)',
      'ชื่อผู้ติดต่อ (Full Name / First / Last)',
      'ตำแหน่งงานผู้ติดต่อ (Title)',
      'เบอร์โทรผู้ติดต่อ',
      'LinkedIn ผู้ติดต่อ',
      'Facebook ผู้ติดต่อ',
      'Instagram ผู้ติดต่อ',
    ],
    credits_per_result: 3,
  },
}

export interface OutscraperResult {
  name?: string; name_for_emails?: string; subtypes?: string; category?: string
  phone?: string; website?: string; address?: string; street?: string
  city?: string; county?: string; state?: string; state_code?: string
  postal_code?: string; country?: string; country_code?: string; domain?: string
  company_name?: string; company_phone?: string; company_phones?: string
  company_linkedin?: string; company_facebook?: string; company_instagram?: string
  company_x?: string; company_youtube?: string
  full_name?: string; first_name?: string; last_name?: string; title?: string
  email?: string; contact_phone?: string; contact_phones?: string
  contact_linkedin?: string; contact_facebook?: string; contact_instagram?: string
  latitude?: number; longitude?: number; time_zone?: string; plus_code?: string
  rating?: number; reviews?: number; reviews_link?: string
  photos_count?: number; photo?: string; logo?: string
  business_status?: string; working_hours?: unknown
  description?: string; verified?: boolean
  place_id?: string; google_id?: string; cid?: string
}

function getEnrichmentServices(pack: EnrichmentPack): string[] {
  switch (pack) {
    case 'cold_calling': return ['phones_enricher_api', 'company_insights_api']
    case 'cold_email': return ['leads_contacts_api', 'emails_validator_api', 'company_insights_api', 'phones_enricher_api']
    default: return []
  }
}

export async function searchGoogleMaps(params: {
  query: string; location: string; limit: number; pack: EnrichmentPack
}): Promise<OutscraperResult[]> {
  const { query, location, limit, pack } = params
  const searchQuery = `${query} ${location}`
  const enrichment = getEnrichmentServices(pack)

  const searchParams = new URLSearchParams({
    query: searchQuery, limit: String(limit),
    language: 'th', region: 'TH',
    dropDuplicates: 'true', async: 'false',
    ...(enrichment.length > 0 && { enrichment: enrichment.join(',') }),
  })

  const res = await fetch(`${BASE_URL}/maps/search-v3?${searchParams}`, {
    headers: { 'X-API-KEY': process.env.OUTSCRAPER_API_KEY!, 'Content-Type': 'application/json' },
  })

  if (!res.ok) throw new Error(`Outscraper error ${res.status}: ${await res.text()}`)

  const json = await res.json()
  if (json.status === 'Success' && Array.isArray(json.data)) return json.data.flat()
  if (json.id) return pollResult(json.id)
  throw new Error(`Unexpected response: ${JSON.stringify(json)}`)
}

async function pollResult(id: string, max = 30): Promise<OutscraperResult[]> {
  for (let i = 0; i < max; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const res = await fetch(`${BASE_URL}/requests/${id}`, {
      headers: { 'X-API-KEY': process.env.OUTSCRAPER_API_KEY! },
    })
    const json = await res.json()
    if (json.status === 'Success' && Array.isArray(json.data)) return json.data.flat()
    if (json.status === 'Failed') throw new Error(`Job failed: ${json.message}`)
  }
  throw new Error('Outscraper job timed out')
}
