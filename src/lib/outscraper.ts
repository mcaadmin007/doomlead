// Outscraper Google Maps API wrapper
// ทำงานเหมือน Google Maps Scraper บน app.outscraper.cloud

const BASE_URL = 'https://api.app.outscraper.com'

// ── Enrichment Packs (เหมือน Outscraper UI) ─────────────────
export type EnrichmentPack = 'basic' | 'cold_calling' | 'cold_email'

export const ENRICHMENT_PACKS: Record<EnrichmentPack, {
  label: string
  description: string
  includes: string[]
  credits_per_result: number
  color: string
}> = {
  basic: {
    label: 'ข้อมูลพื้นฐาน',
    description: 'ชื่อ เบอร์โทร เว็บไซต์ ที่อยู่ เรตติ้ง',
    includes: ['ชื่อธุรกิจ', 'เบอร์โทร', 'เว็บไซต์', 'ที่อยู่', 'เรตติ้ง', 'หมวดหมู่', 'พิกัด GPS'],
    credits_per_result: 1,
    color: 'zinc',
  },
  cold_calling: {
    label: 'Cold Calling Pack',
    description: 'เหมาะสำหรับการโทรหาลูกค้า',
    includes: ['ทุกอย่างใน Basic', 'Phone Numbers Enricher', 'Company Insights', 'Social Media'],
    credits_per_result: 2,
    color: 'blue',
  },
  cold_email: {
    label: 'Cold Email Pack',
    description: 'เหมาะสำหรับ email outreach',
    includes: ['ทุกอย่างใน Cold Calling', 'Email Address', 'ชื่อผู้ติดต่อ', 'Email Verifier', 'LinkedIn Profile'],
    credits_per_result: 3,
    color: 'green',
  },
}

export interface OutscraperResult {
  query?: string
  name?: string
  name_for_emails?: string
  subtypes?: string
  category?: string
  type?: string
  phone?: string
  website?: string
  address?: string
  street?: string
  city?: string
  county?: string
  state?: string
  state_code?: string
  postal_code?: string
  country?: string
  country_code?: string
  domain?: string
  company_name?: string
  company_phone?: string
  company_phones?: string
  company_linkedin?: string
  company_facebook?: string
  company_instagram?: string
  company_x?: string
  company_youtube?: string
  full_name?: string
  first_name?: string
  last_name?: string
  title?: string
  email?: string
  contact_phone?: string
  contact_phones?: string
  contact_linkedin?: string
  contact_facebook?: string
  contact_instagram?: string
  contact_x?: string
  website_title?: string
  website_description?: string
  latitude?: number
  longitude?: number
  time_zone?: string
  plus_code?: string
  rating?: number
  reviews?: number
  reviews_link?: string
  photos_count?: number
  photo?: string
  street_view?: string
  logo?: string
  located_in?: string
  business_status?: string
  working_hours?: unknown
  about?: string
  description?: string
  verified?: boolean
  place_id?: string
  google_id?: string
  cid?: string
}

interface SearchParams {
  query: string
  location: string
  limit: number
  pack: EnrichmentPack
  plainQuery?: boolean  // false = category mode, true = plain text search
}

/**
 * ค้นหาธุรกิจจาก Google Maps ผ่าน Outscraper API
 * รองรับทั้ง category mode และ plain query mode
 */
export async function searchGoogleMaps(params: SearchParams): Promise<OutscraperResult[]> {
  const { query, location, limit, pack, plainQuery = true } = params

  // Format query เหมือน Outscraper
  // Plain query: "ช่างไฟฟ้า กรุงเทพ, Thailand"
  // Category: "Electrician" + location แยก
  const searchQuery = plainQuery
    ? `${query} ${location}, Thailand`
    : query

  const enrichmentServices = getEnrichmentServices(pack)

  const searchParams = new URLSearchParams({
    query: searchQuery,
    limit: String(limit),
    language: 'th',
    region: 'TH',
    dropDuplicates: 'true',
    async: 'false',
    ...(enrichmentServices.length > 0 && {
      enrichment: enrichmentServices.join(','),
    }),
  })

  const response = await fetch(
    `${BASE_URL}/maps/search-v3?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'X-API-KEY': process.env.OUTSCRAPER_API_KEY!,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Outscraper API error ${response.status}: ${errorText}`)
  }

  const json = await response.json()

  if (json.status === 'Success' && Array.isArray(json.data)) {
    return (json.data as OutscraperResult[][]).flat()
  }

  // Async job — poll result
  if (json.id) {
    return await pollResult(json.id)
  }

  throw new Error(`Unexpected Outscraper response: ${JSON.stringify(json)}`)
}

/**
 * Map enrichment pack → Outscraper enrichment service names
 */
function getEnrichmentServices(pack: EnrichmentPack): string[] {
  switch (pack) {
    case 'basic':
      return []
    case 'cold_calling':
      return ['phones_enricher_api', 'company_insights_api']
    case 'cold_email':
      return [
        'leads_contacts_api',
        'emails_validator_api',
        'company_insights_api',
        'phones_enricher_api',
      ]
    default:
      return []
  }
}

/**
 * Poll async job result
 */
async function pollResult(requestId: string, maxRetries = 30): Promise<OutscraperResult[]> {
  for (let i = 0; i < maxRetries; i++) {
    await new Promise((r) => setTimeout(r, 3000))

    const response = await fetch(`${BASE_URL}/requests/${requestId}`, {
      headers: { 'X-API-KEY': process.env.OUTSCRAPER_API_KEY! },
    })

    const json = await response.json()

    if (json.status === 'Success' && Array.isArray(json.data)) {
      return (json.data as OutscraperResult[][]).flat()
    }

    if (json.status === 'Failed') {
      throw new Error(`Outscraper job failed: ${json.message}`)
    }
  }

  throw new Error('Outscraper job timed out after 90 seconds')
}
