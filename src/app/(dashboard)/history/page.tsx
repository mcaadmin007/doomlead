import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:    { label: 'รอดำเนินการ', color: 'text-amber-600 bg-amber-50 border-amber-100' },
  processing: { label: 'กำลังค้นหา', color: 'text-blue-600 bg-blue-50 border-blue-100' },
  done:       { label: 'สำเร็จ',      color: 'text-green-600 bg-green-50 border-green-100' },
  failed:     { label: 'ล้มเหลว',     color: 'text-red-600 bg-red-50 border-red-100' },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('th-TH', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: jobs } = await supabase
    .from('scrape_jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const totalJobs    = jobs?.length ?? 0
  const totalLeads   = jobs?.reduce((s, j) => s + (j.count_returned ?? 0), 0) ?? 0
  const totalCredits = jobs?.reduce((s, j) => s + (j.credits_used ?? 0), 0) ?? 0
  const doneJobs     = jobs?.filter(j => j.status === 'done').length ?? 0

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">ประวัติการค้นหา</h1>
        <p className="text-sm text-zinc-500">รายการค้นหาทั้งหมดของคุณ</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'ค้นหาทั้งหมด', value: totalJobs.toLocaleString() },
          { label: 'สำเร็จ', value: doneJobs.toLocaleString() },
          { label: 'รายชื่อที่ได้', value: totalLeads.toLocaleString() },
          { label: 'เครดิตที่ใช้', value: totalCredits.toLocaleString() },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-zinc-200 rounded-xl p-4">
            <p className="text-xs text-zinc-400 mb-1">{s.label}</p>
            <p className="text-2xl font-bold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {!jobs || jobs.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl py-16 text-center">
          <p className="text-zinc-400 text-sm mb-3">ยังไม่มีประวัติการค้นหา</p>
          <Link
            href="/dashboard/search"
            className="text-sm font-medium bg-black text-white px-4 py-2 rounded-md hover:opacity-80 transition-opacity"
          >
            เริ่มค้นหาตอนนี้ →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">วันที่</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">ประเภทธุรกิจ</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">พื้นที่</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">รายชื่อ</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">อีเมล</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">เครดิต</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">สถานะ</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {jobs.map((job) => {
                  const st = STATUS_LABEL[job.status] ?? STATUS_LABEL.failed
                  return (
                    <tr key={job.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-4 py-3 text-zinc-400 text-xs whitespace-nowrap">
                        {formatDate(job.created_at)}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900">{job.query}</td>
                      <td className="px-4 py-3 text-zinc-600">{job.location}</td>
                      <td className="px-4 py-3 text-zinc-600">
                        {job.count_returned ?? 0}
                        <span className="text-zinc-400">/{job.count_requested}</span>
                      </td>
                      <td className="px-4 py-3">
                        {job.include_email ? (
                          <span className="text-green-600 text-xs">✓ รวม</span>
                        ) : (
                          <span className="text-zinc-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{job.credits_used}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {job.status === 'done' && (
                          <a
                            href={`/api/export?job_id=${job.id}`}
                            className="text-xs font-medium text-zinc-500 hover:text-black transition-colors flex items-center gap-1"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Excel
                          </a>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
