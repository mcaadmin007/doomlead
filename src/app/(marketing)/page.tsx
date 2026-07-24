import Link from 'next/link'
import { LogoIcon } from '@/components/ui/LogoIcon'

const TAGS = ['ชื่อธุรกิจ', 'ที่อยู่เต็ม', 'เบอร์โทร', 'เว็บไซต์', 'อีเมล', 'เรตติ้ง + รีวิว', 'หมวดหมู่', 'พิกัด GPS']

const STEPS = [
  {
    num: '01',
    title: 'พิมพ์สิ่งที่ต้องการหา',
    desc: 'ประเภทธุรกิจ + พื้นที่ เช่น "ช่างไฟฟ้า กรุงเทพ" แล้วเลือกจำนวนที่ต้องการ',
  },
  {
    num: '02',
    title: 'ระบบรวบรวมรายชื่อให้',
    desc: 'ได้ชื่อธุรกิจ ที่อยู่ เบอร์โทร เว็บไซต์ เรตติ้ง — เพิ่มอีเมลได้ถ้าต้องการ',
  },
  {
    num: '03',
    title: 'ดาวน์โหลดเป็นไฟล์',
    desc: 'เป็น Excel / Google Sheets ได้ทันที เอาไปโทรหาลูกค้าต่อได้เลย',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-zinc-200 h-[58px] flex items-center">
        <div className="max-w-[900px] mx-auto px-8 w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-sm tracking-tight text-zinc-900">
            <LogoIcon size={26} />
            DoomLead
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-md hover:bg-zinc-100 transition-colors">
              เข้าสู่ระบบ
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-black text-white px-4 py-1.5 rounded-md hover:opacity-80 transition-opacity">
              สมัครฟรี
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="max-w-[900px] mx-auto px-8 py-20">
        {/* Label */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-px bg-zinc-400" />
          <span className="text-[11px] font-semibold text-zinc-500 tracking-widest uppercase">
            ค้นหา LEADS ธุรกิจ · COLD CALL
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-[clamp(36px,5.2vw,54px)] font-extrabold leading-[1.12] tracking-[-0.03em] text-zinc-900 mb-5 max-w-[640px]">
          หา Leads สำหรับ Cold Call<br />
          ที่คุณต้องการ ได้ที่นี่
        </h1>

        {/* Description */}
        <p className="text-[14.5px] text-zinc-500 leading-[1.78] max-w-[460px] mb-8">
          เลือกประเภทธุรกิจกับพื้นที่ที่อยากได้ แล้วรับรายชื่อพร้อมเบอร์โทร
          เว็บไซต์ อีเมล เป็นไฟล์ Excel พร้อมโทรปิดการขายทันที — จ่ายด้วย
          เครดิต ใช้เท่าไหร่จ่ายเท่านั้น ไม่มีรายเดือน
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/register"
            className="inline-flex items-center gap-1 bg-black text-white text-[14.5px] font-semibold px-5 py-2.5 rounded-lg hover:opacity-80 transition-opacity"
          >
            เริ่มใช้ฟรี →
          </Link>
          <Link
            href="/dashboard/credits"
            className="inline-flex items-center border border-zinc-200 text-zinc-700 text-[14.5px] font-semibold px-5 py-2.5 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            ดูราคาเครดิต
          </Link>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <span key={tag} className="text-[12.5px] font-medium border border-zinc-200 rounded-full px-3 py-1 text-zinc-700">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── DIVIDER ────────────────────────────────────────── */}
      <div className="h-px bg-zinc-200 mx-8" />

      {/* ── STEPS ──────────────────────────────────────────── */}
      <section className="max-w-[900px] mx-auto px-8 py-16">
        <h2 className="text-[22px] font-extrabold tracking-[-0.03em] text-zinc-900 mb-6">
          ใช้งาน 3 ขั้นตอน
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {STEPS.map((s) => (
            <div key={s.num} className="border border-zinc-200 rounded-xl p-6">
              <p className="text-[11.5px] font-semibold text-zinc-400 tracking-wide mb-3">{s.num}</p>
              <h3 className="text-[15px] font-bold text-zinc-900 mb-2 tracking-[-0.02em]">{s.title}</h3>
              <p className="text-[13px] text-zinc-500 leading-[1.7]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────── */}
      <section className="max-w-[900px] mx-auto px-8 pb-20">
        <div className="bg-zinc-900 rounded-xl px-10 py-9 flex items-center justify-between gap-6">
          <div>
            <h2 className="text-[20px] font-extrabold text-white tracking-[-0.03em] mb-1">
              สมัครวันนี้ ได้เครดิตทดลองฟรี
            </h2>
            <p className="text-[13px] text-zinc-400">ลองดึงข้อมูลจริงก่อนตัดสินใจซื้อแพ็ก</p>
          </div>
          <Link
            href="/register"
            className="whitespace-nowrap text-[14.5px] font-semibold bg-white text-zinc-900 px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            สมัครฟรี →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-zinc-200">
        <div className="max-w-[900px] mx-auto px-8 py-5 flex items-center justify-between flex-wrap gap-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-[13.5px] tracking-tight text-zinc-900">
            <LogoIcon size={22} />
            DoomLead
          </Link>
          <p className="text-[12px] text-zinc-400">
            © 2026 DoomLead · รายชื่อธุรกิจพร้อมโทรปิดการขาย · ใช้เท่าไหร่จ่ายเท่านั้น
          </p>
        </div>
      </footer>

    </div>
  )
}
