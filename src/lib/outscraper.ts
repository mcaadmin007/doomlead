// Outscraper Google Maps API wrapper
// Docs: https://docs.outscraper.com/api-reference/maps/

const BASE_URL = 'https://api.app.outscraper.com'

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
  working_hours?: string
  about?: string
  description?: string
  verified?: boolean
  place_id?: string
  google_id?: string
  cid?: string
}

interface SearchParams {
  query: string       // เช่น "ช่างไฟฟ้า กรุงเทพ"
  limit: number       // จำนวนผลลัพธ์
  includeEmail: boolean
  language?: string
  region?: string
}

/**
 * ค้นหาธุรกิจจาก Google Maps ผ่าน Outscraper API
 * Returns array of business results
 */
export async function searchGoogleMaps(params: SearchParams): Promise<OutscraperResult[]> {
  const {
    query,
    limit,
    includeEmail,
    language = 'th',
    region = 'TH',
  } = params

  const searchParams = new URLSearchParams({
    query,
    limit: String(limit),
    language,
    region,
    dropDuplicates: 'true',
    async: 'false', // synchronous สำหรับ request ขนาดเล็ก
  })

  // ถ้าต้องการ email enrichment
  if (includeEmail) {
    searchParams.append('emailsExtractor', 'true')
    searchParams.append('enrichment', 'emails_validator_api')
  }

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

  // Outscraper returns: { data: [[result1, result2, ...]], status: "Success" }
  if (json.status === 'Success' && Array.isArray(json.data)) {
    // data คือ array of arrays (1 array per query)
    const results: OutscraperResult[] = json.data.flat()
    return results
  }

  // handle pending/async response
  if (json.id) {
    // request กำลัง process — poll ผล
    return await pollResult(json.id)
  }

  throw new Error(`Unexpected Outscraper response: ${JSON.stringify(json)}`)
}

/**
 * Poll ผลลัพธ์สำหรับ async requests
 */
async function pollResult(requestId: string, maxRetries = 30): Promise<OutscraperResult[]> {
  for (let i = 0; i < maxRetries; i++) {
    await new Promise((r) => setTimeout(r, 3000)) // รอ 3 วินาที

    const response = await fetch(`${BASE_URL}/requests/${requestId}`, {
      headers: {
        'X-API-KEY': process.env.OUTSCRAPER_API_KEY!,
      },
    })

    const json = await response.json()

    if (json.status === 'Success' && Array.isArray(json.data)) {
      return json.data.flat()
    }

    if (json.status === 'Failed') {
      throw new Error(`Outscraper job failed: ${json.message}`)
    }

    // ยัง pending/running — loop ต่อ
  }

  throw new Error('Outscraper job timed out')
}
