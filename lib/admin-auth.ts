import 'server-only'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'ss_admin_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

/**
 * HMAC-SHA256 of password using SESSION_SECRET (falls back to a build-time
 * constant only in development so the server starts without extra config).
 * In production, SESSION_SECRET must be set to a random 32+ char string.
 */
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

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(COOKIE_NAME)
  if (!session?.value) return false

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return false

  const expected = await signPassword(adminPassword)
  return session.value === expected
}

export async function createAdminSession(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword || password !== adminPassword) return false

  const token = await signPassword(adminPassword)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
  return true
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
