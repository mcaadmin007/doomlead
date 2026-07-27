'use client'

import { useState } from 'react'
import { ENRICHMENT_PACKS, type EnrichmentPack } from '@/lib/outscraper'

const COUNT_OPTIONS = [10, 20, 50, 100, 200, 500]

type Result = Record<string, unknown>

const TABLE_COLS = [
  { key: 'name',            label: 'ชื่อธุรกิจ',    always: true },
  { key: 'phone',           label: 'เบอร์โทร',       always: true },
  { key: 'email',           label: 'อีเมล',          pack: 'cold_email' },
  { key: 'full_name',       label: 'ชื่อผู้ติดต่อ',  pack: 'cold_email' },
  { key: 'contact_phone',   label: 'เบอร์ผู้ติดต่อ', pack: 'cold_calling' },
  { key: 'website',         label: 'เว็บไซต์',       always: true },
  { key: 'address',         label: 'ที่อยู่',         always: true },
  { key: 'category',        label: 'ประเภท',          always: true },
  { key: 'rating',          label: 'เรตติ้ง',         always: true },
  { key: 'business_status', label: 'สถานะ',           always: true },
  { key: 'company_linkedin',label: 'LinkedIn',        pack: 'cold_calling' },
]

const PACK_COLORS: Record<EnrichmentPack, string> = {
  basic:        'border-zinc-200 bg-white',
  cold_calling: 'border-blue-200 bg-blue-50',
  cold_email:   'border-green-200 bg-green-50',
}

const PACK_SELECTED: Record<EnrichmentPack, string> = {
  basic:        'border-black bg-black text-white',
  cold_calling: 'border-blue-600 bg-blue-600 text-white',
  cold_email:   'border-green-600 bg-green-600 text-white',
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [count, setCount] = useState(20)
  const [pack, setPack] = useState<EnrichmentPack>('basic')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Result[]>([])
  const [jobId, setJobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const selectedPack = ENRICHMENT_PACKS[pack]
  const creditCost = count * selectedPack.credits_per_result

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResults([])
    setSearched(false)
    setJobId(null)

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, location, count, pack }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด')

      setResults(data.results ?? [])
      setJobId(data.job_id)
      setSearched(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const visibleCols = TABLE_COLS.filter(col =>
    col.always ||
    (col.pack === 'cold_calling' && (pack === 'cold_calling' || pack === 'cold_email')) ||
    (col.pack === 'cold_email' && pack === 'cold_email')
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">ค้นหา Leads</h1>
        <p className="text-sm text-zinc-500">ดึงข้อมูลธุรกิจจาก Google Maps พร้อมเลือก enrichment pack ที่ต้องการ</p>
      </div>

      <form onSubmit={handleSearch} className="bg-white border border-zinc-200 rounded-xl p-5 mb-6 space-y-5">

        {/* Query + Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              ประเภทธุรกิจ / คำค้นหา
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
              placeholder="เช่น ช่างไฟฟ้า, ร้านอาหาร, Doctor"
              className="w-full border border-zinc-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">พื้นที่</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="เช่น กรุงเทพ, เชียงใหม่, Bangkok"
              className="w-full border border-zinc-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Count */}
        <div>
          <label className="block text-sm font-medium mb-2">จำนวนผลลัพธ์สูงสุด</label>
          <div className="flex flex-wrap gap-2">
            {COUNT_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setCount(opt)}
                className={`px-3 py-2 text-sm rounded-md border font-medium transition-colors ${
                  count === opt
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Enrichment Packs */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Enrichment Pack
            <span className="ml-2 text-xs text-zinc-400 font-normal">เลือก pack เพื่อดึงข้อมูลเพิ่มเติม</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(ENRICHMENT_PACKS) as [EnrichmentPack, typeof ENRICHMENT_PACKS[EnrichmentPack]][]).map(([key, info]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPack(key)}
                className={`border rounded-lg p-3.5 text-left transition-all ${
                  pack === key
                    ? PACK_SELECTED[key]
                    : PACK_COLORS[key] + ' hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className={`text-sm font-semibold ${pack === key ? 'text-white' : 'text-zinc-900'}`}>
                    {info.label}
                  </p>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    pack === key ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {info.credits_per_result} cr
                  </span>
                </div>
                <p className={`text-xs mb-2 ${pack === key ? 'text-white/70' : 'text-zinc-500'}`}>
                  {info.description}
                </p>
                <ul className="space-y-0.5">
                  {info.includes.slice(0, 3).map((item) => (
                    <li key={item} className={`text-xs flex items-center gap-1 ${pack === key ? 'text-white/80' : 'text-zinc-500'}`}>
                      <span>✓</span> {item}
                    </li>
                  ))}
                  {info.includes.length > 3 && (
                    <li className={`text-xs ${pack === key ? 'text-white/60' : 'text-zinc-400'}`}>
                      + {info.includes.length - 3} อื่นๆ
                    </li>
                  )}
                </ul>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
          <p className="text-sm text-zinc-500">
            ใช้{' '}
            <span className="font-semibold text-zinc-900">{creditCost.toLocaleString()} เครดิต</span>
            {' '}· {count} รายชื่อ × {selectedPack.credits_per_result} เครดิต
          </p>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                กำลังดึงข้อมูล...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Get Data
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-zinc-700">
              พบ{' '}
              <span className="font-semibold text-zinc-900">{results.length} รายชื่อ</span>
              {' '}· &ldquo;{query}&rdquo; ใน {location}
            </p>
            {results.length > 0 && (
              <button
                onClick={() => jobId && (window.location.href = `/api/export?job_id=${jobId}`)}
                className="flex items-center gap-1.5 text-sm font-medium border border-zinc-200 bg-white px-3 py-1.5 rounded-md hover:bg-zinc-50 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                ดาวน์โหลด Excel
              </button>
            )}
          </div>

          {results.length > 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="text-left px-3 py-3 text-xs font-medium text-zinc-500">#</th>
                      {visibleCols.map(col => (
                        <th key={col.key} className="text-left px-3 py-3 text-xs font-medium text-zinc-500 whitespace-nowrap">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {results.map((r, i) => (
                      <tr key={i} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-3 py-3 text-zinc-400 text-xs">{i + 1}</td>
                        {visibleCols.map(col => (
                          <td key={col.key} className="px-3 py-3 max-w-[200px]">
                            {col.key === 'website' && r[col.key] ? (
                              <a href={String(r[col.key])} target="_blank" rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs truncate block max-w-[140px]">
                                {String(r[col.key]).replace(/^https?:\/\//, '')}
                              </a>
                            ) : col.key === 'rating' && r[col.key] ? (
                              <span className="flex items-center gap-1">
                                <span className="text-amber-400 text-xs">★</span>
                                <span className="text-zinc-700">{String(r[col.key])}</span>
                                {r.reviews_count && <span className="text-zinc-400 text-xs">({String(r.reviews_count)})</span>}
                              </span>
                            ) : col.key === 'business_status' ? (
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                                r[col.key] === 'OPERATIONAL' ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-500'
                              }`}>
                                {r[col.key] === 'OPERATIONAL' ? 'เปิดอยู่' : String(r[col.key] ?? '—')}
                              </span>
                            ) : (
                              <span className="text-zinc-700 text-xs truncate block max-w-[180px]">
                                {String(r[col.key] ?? '—')}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 border border-zinc-200 rounded-xl bg-white">
              <p className="text-zinc-400 text-sm">ไม่พบรายชื่อสำหรับการค้นหานี้</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
