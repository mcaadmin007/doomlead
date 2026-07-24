import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DoomLead — หา Leads สำหรับ Cold Call',
  description:
    'เลือกประเภทธุรกิจกับพื้นที่ที่อยากได้ แล้วรับรายชื่อพร้อมเบอร์โทร เว็บไซต์ อีเมล เป็นไฟล์ Excel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Thai:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
