'use client'

import { useState, useRef, useEffect } from 'react'
import { ENRICHMENT_PACKS, type EnrichmentPack } from '@/lib/outscraper'
import { BUSINESS_CATEGORIES } from '@/lib/categories-data'
import { COUNTRIES, type Country } from '@/lib/locations-data'

const COUNT_OPTIONS = [10, 20, 50, 100, 200, 500]
type Result = Record<string, unknown>

function SearchableDropdown({ value, onChange, placeholder, options, label }: {
  value: string; onChange: (v: string) => void
  placeholder: string; options: string[]; label?: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(value)
  const ref = useRef<HTMLDivElement>(null)
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase())).slice(0, 20)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} className="relative">
      {label && <label className="block text-sm font-medium mb-1.5">{label}</label>}
      <input type="text" value={search}
        onChange={e => { setSearch(e.target.value); onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)} placeholder={placeholder}
        className="w-full border border-zinc-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-400" />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {filtered.map(opt => (
            <button key={opt} type="button"
              onMouseDown={() => { onChange(opt); setSearch(opt); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition-colors first:rounded-t-lg last:rounded-b-lg">
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ProvinceSelector({ country, selected, onChange }: {
  country: Country | null; selected: string[]; onChange: (v: string[]) => void
}) {
  const [search, setSearch] = useState('')
  if (!country) return null
  const states = country.states
  const filtered = states.filter(s => s.toLowerCase().includes(search.toLowerCase()))
  const allSelected = selected.length === states.length
  const toggle = (s: string) => onChange(selected.includes(s) ? selected.filter(x => x !== s) : [...selected, s])
  const toggleAll = () => onChange(allSelected ? [] : [...states])

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        จังหวัด / พื้นที่
        {selected.length > 0 && <span className="ml-2 text-xs text-zinc-400 font-normal">เลือก {selected.length}/{states.length}</span>}
      </label>
      <div className="border border-zinc-200 rounded-md overflow-hidden">
        <div className="p-2 border-b border-zinc-100">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="เสริชจังหวัด..."
            className="w-full px-2 py-1.5 text-sm border border-zinc-200 rounded outline-none focus:border-zinc-900 placeholder:text-zinc-400" />
        </div>
        <div className="px-3 py-2 border-b border-zinc-100">
          <button type="button" onClick={toggleAll} className="flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-black">
            <div className={`w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 ${allSelected ? 'bg-black border-black' : 'border-zinc-300'}`}>
              {allSelected && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            Select all ({states.length})
          </button>
        </div>
        <div className="max-h-48 overflow-y-auto">
          {filtered.map(s => (
            <button key={s} type="button" onClick={() => toggle(s)}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-left hover:bg-zinc-50 transition-colors">
              <div className={`w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 ${selected.includes(s) ? 'bg-black border-black' : 'border-zinc-300'}`}>
                {selected.includes(s) && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const PACK_BORDER: Record<EnrichmentPack, string> = {
  basic: 'border-zinc-200 bg-white', cold_calling: 'border-blue-200 bg-blue-50', cold_email: 'border-green-200 bg-green-50',
}
const PACK_ACTIVE: Record<EnrichmentPack, string> = {
  basic: 'border-black bg-black text-white', cold_calling: 'border-blue-600 bg-blue-600 text-white', cold_email: 'border-green-600 bg-green-600 text-white',
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(COUNTRIES[0])
  const [countrySearch, setCountrySearch] = useState('Thailand')
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([])
  const [count, setCount] = useState(20)
  const [pack, setPack] = useState<EnrichmentPack>('basic')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Result[]>([])
  const [jobId, setJobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const packInfo = ENRICHMENT_PACKS[pack]
  const locationString = selectedProvinces.length > 0 ? selectedProvinces.join(', ') : (selectedCountry?.name ?? '')
  const creditCost = count * packInfo.credits_per_result

  const handleCountrySelect = (name: string) => {
    setCountrySearch(name)
    const found = COUNTRIES.find(c => c.name.toLowerCase() === name.toLowerCase() || c.nameTH === name)
    setSelectedCountry(found ?? null)
    setSelectedProvinces([])
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCountry && selectedProvinces.length === 0) { setError('กรุณาเลือกประเทศหรือพื้นที่'); return }
    setLoading(true); setError(null); setResults([]); setSearched(false); setJobId(null)
    try {
      const location = selectedProvinces.length > 0 ? selectedProvinces[0] : (selectedCountry?.name ?? '')
      const res = await fetch('/api/scrape', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, location, count, pack }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด')
      setResults(data.results ?? []); setJobId(data.job_id); setSearched(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally { setLoading(false) }
  }

  const TABLE_COLS = [
    { key: 'name', label: 'ชื่อธุรกิจ' },
    { key: 'phone', label: 'เบอร์โทร' },
    ...(pack !== 'basic' ? [{ key: 'contact_phone', label: 'เบอร์ผู้ติดต่อ' }] : []),
    ...(pack === 'cold_email' ? [{ key: 'email', label: 'อีเมล' }, { key: 'full_name', label: 'ชื่อผู้ติดต่อ' }] : []),
    { key: 'website', label: 'เว็บไซต์' },
    { key: 'address', label: 'ที่อยู่' },
    { key: 'category', label: 'ประเภท' },
    { key: 'rating', label: 'เรตติ้ง' },
    { key: 'business_status', label: 'สถานะ' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">ค้นหา Leads</h1>
        <p className="text-sm text-zinc-500">ดึงข้อมูลธุรกิจจาก Google Maps พร้อมเลือก enrichment pack ที่ต้องการ</p>
      </div>

      <form onSubmit={handleSearch} className="bg-white border border-zinc-200 rounded-xl p-5 mb-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SearchableDropdown label="ประเภทธุรกิจ / คำค้นหา" value={query} onChange={setQuery}
            placeholder="เช่น Restaurant, Doctor, ช่างไฟฟ้า" options={BUSINESS_CATEGORIES} />
          <SearchableDropdown label="ประเทศ" value={countrySearch} onChange={handleCountrySelect}
            placeholder="เสริชประเทศ..." options={COUNTRIES.map(c => c.name)} />
        </div>

        {selectedCountry && (
          <ProvinceSelector country={selectedCountry} selected={selectedProvinces} onChange={setSelectedProvinces} />
        )}

        <div>
          <label className="block text-sm font-medium mb-2">จำนวนผลลัพธ์สูงสุด</label>
          <div className="flex flex-wrap gap-2">
            {COUNT_OPTIONS.map(opt => (
              <button key={opt} type="button" onClick={() => setCount(opt)}
                className={`px-3 py-2 text-sm rounded-md border font-medium transition-colors ${count === opt ? 'bg-black text-white border-black' : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Enrichment Pack
            <span className="ml-2 text-xs text-zinc-400 font-normal">เลือก pack เพื่อดึงข้อมูลเพิ่มเติม</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(ENRICHMENT_PACKS) as [EnrichmentPack, typeof ENRICHMENT_PACKS[EnrichmentPack]][]).map(([key, info]) => (
              <button key={key} type="button" onClick={() => setPack(key)}
                className={`border rounded-lg p-3.5 text-left transition-all ${pack === key ? PACK_ACTIVE[key] : PACK_BORDER[key] + ' hover:border-zinc-300'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className={`text-sm font-semibold ${pack === key ? 'text-white' : 'text-zinc-900'}`}>{info.label}</p>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${pack === key ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'}`}>{info.credits_per_result} cr</span>
                </div>
                <p className={`text-xs mb-2 ${pack === key ? 'text-white/70' : 'text-zinc-500'}`}>{info.description}</p>
                <ul className="space-y-0.5">
                  {info.includes.slice(0, 3).map(item => (
                    <li key={item} className={`text-xs flex items-center gap-1 ${pack === key ? 'text-white/80' : 'text-zinc-500'}`}><span>✓</span>{item}</li>
                  ))}
                  {info.includes.length > 3 && <li className={`text-xs ${pack === key ? 'text-white/60' : 'text-zinc-400'}`}>+ {info.includes.length - 3} อื่นๆ</li>}
                </ul>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
          <div>
            <p className="text-sm text-zinc-500">
              ใช้ <span className="font-semibold text-zinc-900">{creditCost.toLocaleString()} เครดิต</span> · {count} × {packInfo.credits_per_result} cr
            </p>
            {selectedProvinces.length > 0 && <p className="text-xs text-zinc-400 mt-0.5">พื้นที่: {locationString}</p>}
          </div>
          <button type="submit" disabled={loading || !query}
            className="flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:opacity-80 transition-opacity disabled:opacity-50">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />กำลังดึงข้อมูล...</>
              : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>Get Data</>}
          </button>
        </div>
      </form>

      {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">{error}</div>}

      {searched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-zinc-700">
              พบ <span className="font-semibold">{results.length} รายชื่อ</span> · &ldquo;{query}&rdquo; ใน {locationString}
            </p>
            {results.length > 0 && (
              <button onClick={() => jobId && (window.location.href = `/api/export?job_id=${jobId}`)}
                className="flex items-center gap-1.5 text-sm font-medium border border-zinc-200 bg-white px-3 py-1.5 rounded-md hover:bg-zinc-50">
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
                              <span className="text-zinc-700 text-xs truncate block max-w-[180px]">{String(r[col.key] ?? '—')}</span>
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
