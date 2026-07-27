export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-pulse" role="status" aria-label="กำลังโหลด">
      <div className="h-7 w-48 rounded bg-zinc-200 mb-2" />
      <div className="h-4 w-64 rounded bg-zinc-200 mb-8" />
      <div className="grid grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 rounded-xl bg-zinc-200" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-zinc-200" />
      <span className="sr-only">กำลังโหลดข้อมูล กรุณารอสักครู่</span>
    </div>
  )
}
