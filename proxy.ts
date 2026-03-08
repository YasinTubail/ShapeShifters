import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'ss_admin_session'

async function signPassword(password: string): Promise<string> {
  const secret = process.env.SESSION_SECRET ?? 'dev-only-secret-change-in-production'
  const encoder = new TextEncoder()

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(password))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect all /admin routes except the login page itself
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = request.cookies.get(COOKIE_NAME)
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!session?.value || !adminPassword) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const expected = await signPassword(adminPassword)
    if (session.value !== expected) {
      // Clear the invalid cookie and redirect
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete(COOKIE_NAME)
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
