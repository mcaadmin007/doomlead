export interface Profile {
  id: string
  credits_balance: number
  created_at: string
}

export interface ScrapeJob {
  id: string
  user_id: string
  query: string
  location: string
  count_requested: number
  count_returned: number
  include_email: boolean
  credits_used: number
  status: 'pending' | 'processing' | 'done' | 'failed'
  created_at: string
}

export interface JobResult {
  id: string
  job_id: string
  name: string | null
  address: string | null
  phone: string | null
  website: string | null
  email: string | null
  rating: number | null
  reviews_count: number | null
  category: string | null
  lat: number | null
  lng: number | null
}

export interface CreditTransaction {
  id: string
  user_id: string
  type: 'purchase' | 'usage'
  amount: number
  description: string | null
  job_id: string | null
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  omise_charge_id: string | null
  amount_thb: number
  credits_purchased: number
  status: 'pending' | 'success' | 'failed'
  created_at: string
}

export interface CreditPackage {
  id: string
  name: string
  credits: number
  price_thb: number
  popular?: boolean
}

export interface SearchParams {
  query: string
  location: string
  count: number
  include_email: boolean
}
