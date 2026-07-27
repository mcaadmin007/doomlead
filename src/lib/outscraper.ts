const BASE_URL = 'https://api.app.outscraper.com'

export type EnrichmentPack = 'basic' | 'cold_calling' | 'cold_email'

export const ENRICHMENT_PACKS: Record<EnrichmentPack, {
  label: string
  description: string
  includes: string[]
  credits_per_result: number
}> = {
  basic: {
    label: 'ข้อมูลพื้นฐาน',
    description: 'ชื่อ เบอร์โทร เว็บไซต์ ที่อยู่ เรตติ้ง',
    includes: ['ชื่อธุรกิจ', 'เบอร์โทร', 'เว็บไซต์', 'ที่อยู่', 'เรตติ้ง', 'หมวดหมู่', 'พิกัด GPS'],
    credits_per_result: 1,
  },
  cold_calling: {
    label: 'Cold Calling Pack',
    description: 'เหมาะสำหรับการโทรหาลูกค้า',
    includes: ['ทุกอย่างใน Basic', 'Phone Numbers Enricher', 'Company Insights', 'Social Media'],
    credits_per_result: 2,
  },
  cold_email: {
    label: 'Cold Email Pack',
    description: 'เหมาะสำหรับ email outreach',
    includes: ['ทุกอย่างใน Cold Calling', 'Email Address', 'ชื่อผู้ติดต่อ', 'Email Verifier', 'LinkedIn'],
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
  contact_x?: string; website_title?: string; website_description?: string
  latitude?: number; longitude?: number; time_zone?: string; plus_code?: string
  rating?: number; reviews?: number; reviews_link?: string
  photos_count?: number; photo?: string; street_view?: string; logo?: string
  located_in?: string; business_status?: string; working_hours?: unknown
  about?: string; description?: string; verified?: boolean
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
  const searchQuery = `${query} ${location}, Thailand`
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
