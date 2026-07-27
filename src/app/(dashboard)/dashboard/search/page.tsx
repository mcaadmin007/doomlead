'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ENRICHMENT_PACKS, type EnrichmentPack } from '@/lib/outscraper'
import { BUSINESS_CATEGORIES } from '@/lib/categories-data'
import { COUNTRIES, type Country } from '@/lib/locations-data'

const COUNT_OPTIONS = [10, 20, 50, 100, 200, 500]
type Result = Record<string, unknown>

// ── Searchable Input with Dropdown ──────────────────────────
function ComboBox({ label, value, onChange, options, placeholder, showAllOnOpen = false, optionIcons }: {
  label: string; value: string; onChange: (v: string) => void
  options: string[]; placeholder: string; showAllOnOpen?: boolean
  optionIcons?: Record<string, string>
}) {
  const [open, setOpen] = useState(false)
  const [filtering, setFiltering] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const filtered = showAllOnOpen && open && !filtering
    ? options
    : value
    ? options.filter(o => o.toLowerCase().includes(value.toLowerCase())).slice(0, 30)
    : options.slice(0, 30)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setFiltering(true); setOpen(true) }}
          onFocus={() => { setFiltering(false); setOpen(true) }}
          placeholder={placeholder}
          className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm pr-8 outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 transition-all placeholder:text-zinc-400"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.map(opt => (
            <button key={opt} type="button"
              onMouseDown={() => { onChange(opt); setFiltering(false); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-zinc-50 flex items-center gap-2 ${value === opt ? 'bg-zinc-50 font-medium' : ''}`}>
              {optionIcons?.[opt] && <span className="text-base leading-none" aria-hidden="true">{optionIcons[opt]}</span>}
              <span>{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Province / State Multi-Select ────────────────────────────
function LocationSelector({ country, selected, onChange }: {
  country: Country | null; selected: string[]; onChange: (v: string[]) => void
}) {
  const [search, setSearch] = useState('')
  if (!country) return null

  const filtered = country.states.filter(s => s.toLowerCase().includes(search.toLowerCase()))
  const allSelected = selected.length === country.states.length

  const toggle = (s: string) =>
    onChange(selected.includes(s) ? selected.filter(x => x !== s) : [...selected, s])

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">
        จังหวัด / พื้นที่
        {selected.length > 0 && (
          <span className="ml-2 text-xs font-normal text-blue-600">เลือกแล้ว {selected.length} พื้นที่</span>
        )}
      </label>
      <div className="border border-zinc-200 rounded-lg overflow-hidden">
        <div className="p-2.5 border-b border-zinc-100 bg-zinc-50">
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="เสริชจังหวัด / พื้นที่..."
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-zinc-200 rounded-md outline-none focus:border-zinc-800 placeholder:text-zinc-400" />
          </div>
        </div>

        <div className="px-2.5 py-2 border-b border-zinc-100">
          <button type="button" onClick={() => onChange(allSelected ? [] : [...country.states])}
            className="flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-black w-full">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${allSelected ? 'bg-black border-black' : 'border-zinc-300'}`}>
              {allSelected && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            Select all ({country.states.length})
          </button>
        </div>

        <div className="max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-zinc-400 px-3 py-4 text-center">ไม่พบจังหวัดที่ค้นหา</p>
          ) : (
            filtered.map(s => (
              <button key={s} type="button" onClick={() => toggle(s)}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-left hover:bg-zinc-50 transition-colors">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected.includes(s) ? 'bg-black border-black' : 'border-zinc-300'}`}>
                  {selected.includes(s) && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span className={selected.includes(s) ? 'font-medium text-zinc-900' : 'text-zinc-600'}>{s}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ── Pack Card ────────────────────────────────────────────────
const PACK_STYLES: Record<EnrichmentPack, { idle: string; active: string; badge: string; text: string; sub: string; check: string }> = {
  basic: {
    idle:   'border-zinc-200 bg-white hover:border-zinc-400',
    active: 'border-black bg-black',
    badge:  'bg-zinc-100 text-zinc-600',
    text:   'text-zinc-900', sub: 'text-zinc-500', check: 'text-zinc-400',
  },
  cold_calling: {
    idle:   'border-blue-200 bg-blue-50/50 hover:border-blue-400',
    active: 'border-blue-600 bg-blue-600',
    badge:  'bg-blue-100 text-blue-700',
    text:   'text-blue-900', sub: 'text-blue-600', check: 'text-blue-400',
  },
  cold_email: {
    idle:   'border-green-200 bg-green-50/50 hover:border-green-400',
    active: 'border-green-600 bg-green-600',
    badge:  'bg-green-100 text-green-700',
    text:   'text-green-900', sub: 'text-green-600', check: 'text-green-400',
  },
}

// ── Main Page ────────────────────────────────────────────────
export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(COUNTRIES[0])
  const [countryName, setCountryName] = useState('Thailand')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [count, setCount] = useState(20)
  const [pack, setPack] = useState<EnrichmentPack>('basic')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Result[]>([])
  const [jobId, setJobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const packInfo = ENRICHMENT_PACKS[pack]
  const creditCost = count * packInfo.credits_per_result

  const handleCountryChange = (name: string) => {
    setCountryName(name)
    const found = COUNTRIES.find(c =>
      c.name.toLowerCase() === name.toLowerCase()
    )
    setSelectedCountry(found ?? null)
    setSelectedLocations([])
  }

  const locationLabel = selectedLocations.length > 0
    ? selectedLocations.join(', ')
    : (selectedCountry?.name ?? '')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) { setError('กรุณาระบุประเภทธุรกิจ'); return }
    setLoading(true); setError(null); setResults([]); setSearched(false); setJobId(null)
    try {
      const locations = selectedLocations.length > 0
        ? selectedLocations
        : [selectedCountry?.name ?? 'Thailand']
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          country: selectedCountry?.name ?? 'Thailand',
          locations,
          count,
          pack,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด')
      setResults(data.results ?? []); setJobId(data.job_id); setSearched(true)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally { setLoading(false) }
  }

  const TABLE_COLS = [
    { key: 'name', label: 'ชื่อธุรกิจ' },
    { key: 'phone', label: 'เบอร์โทร' },
    ...(pack !== 'basic' ? [{ key: 'contact_phone', label: 'เบอร์ผู้ติดต่อ' }] : []),
    ...(pack === 'cold_email' ? [
      { key: 'email', label: 'อีเมล' },
      { key: 'full_name', label: 'ชื่อผู้ติดต่อ' },
    ] : []),
    { key: 'website', label: 'เว็บไซต์' },
    { key: 'address', label: 'ที่อยู่' },
    { key: 'category', label: 'ประเภท' },
    { key: 'rating', label: 'เรตติ้ง' },
    { key: 'business_status', label: 'สถานะ' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">ค้นหา Leads</h1>
        <p className="text-sm text-zinc-500">ดึงข้อมูลธุรกิจจาก Google Maps ทั่วโลก พร้อม enrichment</p>
      </div>

      <form onSubmit={handleSearch} className="bg-white border border-zinc-200 rounded-xl p-5 mb-6 space-y-5">

        {/* Row 1: Category + Country */}
        <div className="grid grid-cols-2 gap-4">
          <ComboBox
            label="ประเภทธุรกิจ / คำค้นหา"
            value={query}
            onChange={setQuery}
            placeholder="เช่น Restaurant, Doctor, ช่างไฟฟ้า"
            options={BUSINESS_CATEGORIES}
          />
          <ComboBox
            label="ประเทศ"
            value={countryName}
            onChange={handleCountryChange}
            placeholder="เสริชประเทศ..."
            options={COUNTRIES.map(c => c.name)}
            optionIcons={Object.fromEntries(COUNTRIES.map(c => [c.name, c.flag]))}
            showAllOnOpen
          />
        </div>

        {/* Province selector (updates when country changes) */}
        {selectedCountry && selectedCountry.states.length > 0 && (
          <LocationSelector
            country={selectedCountry}
            selected={selectedLocations}
            onChange={setSelectedLocations}
          />
        )}

        {/* Count */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">จำนวนผลลัพธ์สูงสุด</label>
          <div className="flex flex-wrap gap-2">
            {COUNT_OPTIONS.map(opt => (
              <button key={opt} type="button" onClick={() => setCount(opt)}
                className={`px-3.5 py-2 text-sm rounded-lg border font-medium transition-all ${
                  count === opt ? 'bg-black text-white border-black shadow-sm' : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                }`}>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Enrichment Packs */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Enrichment Pack
            <span className="ml-2 text-xs font-normal text-zinc-400">เลือก pack เพื่อดึงข้อมูลเพิ่มเติม</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(ENRICHMENT_PACKS) as [EnrichmentPack, typeof ENRICHMENT_PACKS[EnrichmentPack]][]).map(([key, info]) => {
              const s = PACK_STYLES[key]
              const active = pack === key
              return (
                <button key={key} type="button" onClick={() => setPack(key)}
                  className={`border rounded-xl p-4 text-left transition-all ${active ? s.active : s.idle}`}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className={`text-sm font-bold ${active ? 'text-white' : s.text}`}>{info.label}</p>
                      <p className={`text-xs mt-0.5 ${active ? 'text-white/70' : s.sub}`}>{info.description}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${active ? 'bg-white/20 text-white' : s.badge}`}>
                      {info.credits_per_result} cr
                    </span>
                  </div>
                  {/* Divider */}
                  <div className={`h-px my-2 ${active ? 'bg-white/20' : 'bg-zinc-100'}`} />
                  {/* Full list */}
                  <ul className="space-y-1">
                    {info.includes.map(item => (
                      <li key={item} className={`text-xs flex items-start gap-1.5 ${active ? 'text-white/85' : 'text-zinc-600'}`}>
                        <span className={`mt-0.5 flex-shrink-0 ${active ? 'text-white/60' : s.check}`}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          <div>
            <p className="text-sm text-zinc-500">
              ใช้ <span className="font-semibold text-zinc-900">{creditCost.toLocaleString()} เครดิต</span>
              <span className="text-zinc-400 ml-1">· {count} รายชื่อ × {packInfo.credits_per_result} เครดิต</span>
            </p>
            {selectedLocations.length > 0 && (
              <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-sm">พื้นที่: {locationLabel}</p>
            )}
          </div>
          <button type="submit" disabled={loading || !query.trim()}
            className="flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-40">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />กำลังดึงข้อมูล...</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>Get Data</>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">{error}</div>
      )}

      {searched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-zinc-700">
              พบ <span className="font-semibold text-zinc-900">{results.length} รายชื่อ</span>
              {' '}· &ldquo;{query}&rdquo; ใน {locationLabel}
            </p>
            {results.length > 0 && (
              <button onClick={() => jobId && (window.location.href = `/api/export?job_id=${jobId}`)}
                className="flex items-center gap-1.5 text-sm font-medium border border-zinc-200 bg-white px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
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
                      {TABLE_COLS.map(col => (
                        <th key={col.key} className="text-left px-3 py-3 text-xs font-medium text-zinc-500 whitespace-nowrap">{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {results.map((r, i) => (
                      <tr key={i} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-3 py-3 text-zinc-400 text-xs">{i + 1}</td>
                        {TABLE_COLS.map(col => (
                          <td key={col.key} className="px-3 py-3 max-w-[200px]">
                            {col.key === 'website' && r[col.key] != null ? (
                              <a href={String(r[col.key])} target="_blank" rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs truncate block max-w-[140px]">
                                {String(r[col.key]).replace(/^https?:\/\//, '')}
                              </a>
                            ) : col.key === 'rating' && r[col.key] != null ? (
                              <span className="flex items-center gap-1">
                                <span className="text-amber-400 text-xs">★</span>
                                <span className="text-zinc-700">{String(r[col.key])}</span>
                                {r.reviews_count != null && (
                                  <span className="text-zinc-400 text-xs">({String(r.reviews_count)})</span>
                                )}
                              </span>
                            ) : col.key === 'business_status' ? (
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${r[col.key] === 'OPERATIONAL' ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-500'}`}>
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
