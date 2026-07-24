import Omise from 'omise'

const omise = Omise({
  secretKey: process.env.OMISE_SECRET_KEY!,
  omiseVersion: '2019-05-29',
})

export default omise

// ── Credit Packages ──────────────────────────────────────────
export const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 300,
    price_thb: 199,
    per_credit: '0.66',
    popular: false,
  },
  {
    id: 'popular',
    name: 'Popular',
    credits: 1000,
    price_thb: 499,
    per_credit: '0.50',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 3000,
    price_thb: 1199,
    per_credit: '0.40',
    popular: false,
  },
  {
    id: 'business',
    name: 'Business',
    credits: 10000,
    price_thb: 2999,
    per_credit: '0.30',
    popular: false,
  },
] as const

export type PackageId = (typeof CREDIT_PACKAGES)[number]['id']

export function getPackage(id: string) {
  return CREDIT_PACKAGES.find((p) => p.id === id) ?? null
}
