import 'server-only'
import { cookies } from 'next/headers'
import { readAdminUsers, writeAdminUsers, type AdminUser } from './admin-users'

export type { AdminUser, AdminRole } from './admin-users'

const COOKIE_NAME = 'ss_admin_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

// ─── Crypto helpers ───────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const secret = process.env.SESSION_SECRET ?? 'dev-only-secret-change-in-production'
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(password))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function makeSessionToken(username: string): Promise<string> {
  const secret = process.env.SESSION_SECRET ?? 'dev-only-secret-change-in-production'
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`${username}:admin-session`))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

/**
 * If no users exist yet, seed one "admin" / "owner" from ADMIN_PASSWORD env var.
 * This ensures backward-compat on first deploy.
 */
export async function bootstrapIfEmpty(): Promise<AdminUser[]> {
  const users = readAdminUsers()
  if (users.length > 0) return users

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return []

  const passwordHash = await hashPassword(adminPassword)
  const seed: AdminUser = {
    id: crypto.randomUUID(),
    username: 'admin',
    email: '',
    passwordHash,
    role: 'owner',
    createdAt: new Date().toISOString(),
    lastLogin: null,
    active: true,
  }
  // Best-effort write — Vercel serverless has a read-only FS so this may throw.
  // We return [seed] regardless so login still works in-memory for this request.
  try { writeAdminUsers([seed]) } catch { /* read-only filesystem — that's OK */ }
  return [seed]
}

// ─── Session ──────────────────────────────────────────────────────────────────

/** Read the current user from the session cookie (null if invalid). */
export async function getCurrentUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(COOKIE_NAME)
  if (!session?.value) return null

  const idx = session.value.indexOf(':')
  if (idx === -1) return null
  const username = session.value.slice(0, idx)
  const token = session.value.slice(idx + 1)
  if (!username || !token) return null

  const expected = await makeSessionToken(username)
  if (token !== expected) return null

  const users = await bootstrapIfEmpty()
  return users.find(u => u.username === username && u.active) ?? null
}

/** Returns true when a valid admin session cookie exists. */
export async function verifyAdminSession(): Promise<boolean> {
  return (await getCurrentUser()) !== null
}

/** Create a session cookie for the given username + password. */
export async function createAdminSession(username: string, password: string): Promise<boolean> {
  const users = await bootstrapIfEmpty()
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.active)
  if (!user) return false

  const hash = await hashPassword(password)
  if (hash !== user.passwordHash) return false

  // Update lastLogin — best-effort, may fail on read-only FS (Vercel)
  try {
    writeAdminUsers(users.map(u => u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u))
  } catch { /* ignore — read-only filesystem on Vercel serverless */ }

  const token = await makeSessionToken(user.username)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, `${user.username}:${token}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
  return true
}

/** Delete the session cookie. */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
