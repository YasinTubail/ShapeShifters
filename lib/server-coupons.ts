import 'server-only'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Coupon {
  id: string
  code: string              // e.g. "SUMMER20" — always stored uppercase
  type: 'percentage' | 'fixed'
  value: number             // 20 → 20%, or 50 → ₺50 off
  minOrderAmount: number    // 0 = no minimum
  maxUses: number           // 0 = unlimited
  usedCount: number
  usedByEmails: string[]    // one-time-per-email tracking (lowercase)
  active: boolean
  expiresAt: string | null  // ISO date or null
  createdAt: string
}

export interface CouponValidationResult {
  valid: boolean
  error?: string
  coupon?: Coupon
  discountAmount?: number
}

// ─── Persistence ──────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), 'data', 'coupons.json')

export function readCoupons(): Coupon[] {
  try {
    const raw = readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(raw) as Coupon[]
  } catch {
    return []
  }
}

export function writeCoupons(coupons: Coupon[]): void {
  writeFileSync(DATA_FILE, JSON.stringify(coupons, null, 2), 'utf-8')
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validate a coupon code against the current order total.
 * Returns the discount amount in the site's base currency.
 */
export function validateCouponSync(
  code: string,
  orderTotal: number,
  email?: string,
): CouponValidationResult {
  const coupons = readCoupons()
  const coupon = coupons.find(c => c.code === code.toUpperCase().trim())

  if (!coupon) return { valid: false, error: 'Coupon code not found.' }
  if (!coupon.active) return { valid: false, error: 'This coupon is no longer active.' }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, error: 'This coupon has expired.' }
  }

  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: 'This coupon has reached its usage limit.' }
  }

  if (coupon.minOrderAmount > 0 && orderTotal < coupon.minOrderAmount) {
    return {
      valid: false,
      error: `A minimum order of ₺${coupon.minOrderAmount.toLocaleString()} is required for this coupon.`,
    }
  }

  if (email && coupon.usedByEmails.includes(email.toLowerCase())) {
    return { valid: false, error: 'You have already used this coupon.' }
  }

  const discountAmount =
    coupon.type === 'percentage'
      ? Math.round(orderTotal * (coupon.value / 100))
      : Math.min(coupon.value, orderTotal)

  return { valid: true, coupon, discountAmount }
}

/**
 * Mark a coupon as used (increment counter + record email).
 * Called after a successful payment by the Stripe webhook.
 */
export function markCouponUsed(code: string, email?: string): void {
  try {
    const coupons = readCoupons()
    const updated = coupons.map(c => {
      if (c.code !== code.toUpperCase().trim()) return c
      return {
        ...c,
        usedCount: c.usedCount + 1,
        usedByEmails: email
          ? [...new Set([...c.usedByEmails, email.toLowerCase()])]
          : c.usedByEmails,
      }
    })
    writeCoupons(updated)
  } catch { /* read-only FS on Vercel — skip */ }
}
