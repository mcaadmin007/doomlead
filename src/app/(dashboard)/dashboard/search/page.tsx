'use client'

import { useState } from 'react'
import type { JobResult } from '@/types'

const COUNT_OPTIONS = [10, 20, 50, 100, 200]

function calcCredits(count: number, includeEmail: boolean) {
  return count * (includeEmail ? 2 : 1)
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [count, setCount] = useState(20)
  const [includeEmail, setIncludeEmail] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<JobResult[]>([])
  const [jobId, setJobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const creditCost = calcCredits(count, includeEmail)

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
        body: JSON.stringify({ query, location, count, include_email: includeEmail }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่')

      setResults(data.results ?? [])
      setJobId(data.job_id)
      setSearched(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!jobId) return
    window.location.href = `/api/export?job_id=${jobId}`
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">ค้นหา Leads</h1>
        <p className="text-sm text-zinc-500">
          พิมพ์ประเภทธุรกิจและพื้นที่ แล้วรับรายชื่อพร้อมเบอร์โทร เว็บไซต์ อีเมลได้ทันที
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="bg-white border border-zinc-200 rounded-xl p-5 mb-6 space-y-4"
      >
        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">ประเภทธุรกิจ</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
              placeholder="เช่น ช่างไฟฟ้า, ร้านอาหาร, ทนายความ"
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
              placeholder="เช่น กรุงเทพ, เชียงใหม่, ชลบุรี"
              className="w-full border border-zinc-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Count + Email Toggle */}
        <div className="flex flex-wrap items-end gap-6">
          {/* Count */}
          <div>
            <label className="block text-sm font-medium mb-2">จำนวนรายชื่อ</label>
            <div className="flex gap-2">
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

          {/* Include Email Toggle */}
          <div className="flex items-center gap-2.5 pb-0.5">
            <button
              type="button"
              role="switch"
              aria-checked={includeEmail}
              onClick={() => setIncludeEmail(!includeEmail)}
              className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                includeEmail ? 'bg-black' : 'bg-zinc-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                  includeEmail ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className="text-sm text-zinc-700 cursor-pointer select-none"
              onClick={() => setIncludeEmail(!includeEmail)}
            >
              รวมอีเมล{' '}
              <span className="text-zinc-400 text-xs">(2 เครดิต/รายชื่อ)</span>
            </span>
          </div>
        </div>

        {/* Footer: credit estimate + submit */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-100 mt-2">
          <p className="text-sm text-zinc-500">
            ใช้{' '}
            <span className="font-semibold text-zinc-900">{creditCost.toLocaleString()} เครดิต</span>{' '}
            สำหรับการค้นหานี้
          </p>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                กำลังค้นหา...
              </>
            ) : (
              'ค้นหา →'
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
              <span className="text-zinc-900 font-semibold">{results.length} รายชื่อ</span>{' '}
              สำหรับ &ldquo;{query}&rdquo; ใน {location}
            </p>
            {results.length > 0 && (
              <button
                onClick={handleExport}
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
                      <th className="text-left px-4 py-3 font-medium text-zinc-500 text-xs">#</th>
                      <th className="text-left px-4 py-3 font-medium text-zinc-500 text-xs">ชื่อธุรกิจ</th>
                      <th className="text-left px-4 py-3 font-medium text-zinc-500 text-xs">เบอร์โทร</th>
                      <th className="text-left px-4 py-3 font-medium text-zinc-500 text-xs">ที่อยู่</th>
                      <th className="text-left px-4 py-3 font-medium text-zinc-500 text-xs">เว็บไซต์</th>
                      {includeEmail && (
                        <th className="text-left px-4 py-3 font-medium text-zinc-500 text-xs">อีเมล</th>
                      )}
                      <th className="text-left px-4 py-3 font-medium text-zinc-500 text-xs">เรตติ้ง</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {results.map((r, i) => (
                      <tr key={r.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3 text-zinc-400 text-xs">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-zinc-900">{r.name || '-'}</td>
                        <td className="px-4 py-3 text-zinc-600">{r.phone || '-'}</td>
                        <td className="px-4 py-3 text-zinc-500 max-w-[180px]">
                          <span className="truncate block">{r.address || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          {r.website ? (
                            <a
                              href={r.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-xs truncate block max-w-[130px]"
                            >
                              {r.website.replace(/^https?:\/\//, '')}
                            </a>
                          ) : (
                            <span className="text-zinc-400">-</span>
                          )}
                        </td>
                        {includeEmail && (
                          <td className="px-4 py-3 text-zinc-600 text-xs">{r.email || '-'}</td>
                        )}
                        <td className="px-4 py-3">
                          {r.rating ? (
                            <span className="flex items-center gap-1">
                              <span className="text-amber-400 text-xs">★</span>
                              <span className="text-zinc-700">{r.rating}</span>
                              <span className="text-zinc-400 text-xs">({r.reviews_count ?? 0})</span>
                            </span>
                          ) : (
                            <span className="text-zinc-400">-</span>
                          )}
                        </td>
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
