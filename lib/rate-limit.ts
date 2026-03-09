/**
 * Simple in-memory rate limiter for server actions.
 * Resets on server restart. Good enough for a single-admin panel.
 */

interface Attempt {
  count: number
  firstAt: number
  lockedUntil?: number
}

const store = new Map<string, Attempt>()

const WINDOW_MS = 15 * 60 * 1000  // 15 minutes
const MAX_ATTEMPTS = 10             // max attempts per window
const LOCKOUT_MS = 30 * 60 * 1000  // 30-minute lockout after max attempts

export function checkRateLimit(key: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (entry?.lockedUntil) {
    if (now < entry.lockedUntil) {
      return { allowed: false, retryAfterMs: entry.lockedUntil - now }
    }
    // Lockout expired — reset
    store.delete(key)
  }

  if (!entry || now - entry.firstAt > WINDOW_MS) {
    store.set(key, { count: 1, firstAt: now })
    return { allowed: true }
  }

  entry.count++

  if (entry.count > MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS
    return { allowed: false, retryAfterMs: LOCKOUT_MS }
  }

  return { allowed: true }
}

export function resetRateLimit(key: string): void {
  store.delete(key)
}
