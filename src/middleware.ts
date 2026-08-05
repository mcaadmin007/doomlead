import { NextResponse, type NextRequest } from 'next/server'

/**
 * Lightweight middleware — no async Supabase calls.
 * Auth is verified by checking for the Supabase session cookie.
 * The actual user validation happens in the dashboard layout server component.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for Supabase auth session cookie (sb-{ref}-auth-token)
  const cookies = request.cookies.getAll()
  const hasSession = cookies.some(
    c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token') && c.value
  )

  // Redirect unauthenticated users away from dashboard
  if (!hasSession && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (hasSession && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard/search', request.url))
  }

  // Redirect /dashboard → /dashboard/search
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
