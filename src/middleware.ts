import { NextResponse, type NextRequest } from 'next/server'

/**
 * Lightweight sync middleware — no Supabase SDK, no network calls.
 * Checks for ANY Supabase session cookie (including chunked tokens .0/.1).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Supabase session cookies can be:
  // - sb-{ref}-auth-token          (full token)
  // - sb-{ref}-auth-token.0        (chunked)
  // - sb-{ref}-auth-token.1
  const cookies = request.cookies.getAll()
  const hasSession = cookies.some(
    c => c.name.startsWith('sb-') && c.name.includes('auth-token') && c.value.length > 0
  )

  // Redirect unauthenticated users away from dashboard
  if (!hasSession && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from auth pages
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
