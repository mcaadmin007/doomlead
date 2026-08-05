import { NextResponse, type NextRequest } from 'next/server'

const SESSION_MAX_HOURS = 24

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ตรวจสอบ Supabase session cookie
  const cookies = request.cookies.getAll()
  const hasSession = cookies.some(
    c => c.name.startsWith('sb-') && c.name.includes('auth-token') && c.value.length > 0
  )

  // ตรวจสอบ session อายุไม่เกิน 24 ชั่วโมง
  if (hasSession && pathname.startsWith('/dashboard')) {
    const sessionStart = request.cookies.get('dl_session_start')?.value
    if (sessionStart) {
      const hoursElapsed = (Date.now() - parseInt(sessionStart, 10)) / (1000 * 60 * 60)
      if (hoursElapsed > SESSION_MAX_HOURS) {
        // Session เกิน 24 ชม. → บังคับ logout
        return NextResponse.redirect(new URL('/api/auth/logout', request.url))
      }
    }
  }

  // Redirect unauthenticated → login
  if (!hasSession && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated → dashboard
  if (hasSession && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard/search', request.url))
  }

  // /dashboard → /dashboard/search
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/dashboard/search', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
