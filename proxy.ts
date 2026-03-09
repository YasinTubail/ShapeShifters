import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'ss_admin_session'

// Public admin routes — no auth required
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/forgot-password', '/admin/reset-password']

async function makeSessionToken(username: string): Promise<string> {
  const secret = process.env.SESSION_SECRET ?? 'dev-only-secret-change-in-production'
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`${username}:admin-session`))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/admin') &&
    !PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + '?'))
  ) {
    const session = request.cookies.get(COOKIE_NAME)

    if (!session?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Cookie format: "username:HMAC(SESSION_SECRET, username + ':admin-session')"
    const idx = session.value.indexOf(':')
    if (idx === -1) {
      const res = NextResponse.redirect(new URL('/admin/login', request.url))
      res.cookies.delete(COOKIE_NAME)
      return res
    }

    const username = session.value.slice(0, idx)
    const token = session.value.slice(idx + 1)

    const expected = await makeSessionToken(username)
    if (!username || !token || token !== expected) {
      const res = NextResponse.redirect(new URL('/admin/login', request.url))
      res.cookies.delete(COOKIE_NAME)
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
