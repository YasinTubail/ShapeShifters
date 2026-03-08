'use server'

import { revalidatePath } from 'next/cache'
import {
  readCoupons,
  writeCoupons,
  validateCouponSync,
  type Coupon,
} from '@/lib/server-coupons'
import { verifyAdminSession } from '@/lib/admin-auth'

// ─── Storefront: validate a coupon ───────────────────────────────────────────

export interface ValidateCouponResult {
  valid: boolean
  error?: string
  code?: string
  discountAmount?: number
  type?: 'percentage' | 'fixed'
  value?: number
}

export async function validateCoupon(
  code: string,
  orderTotal: number,
  email?: string,
): Promise<ValidateCouponResult> {
  if (!code.trim()) return { valid: false, error: 'Please enter a coupon code.' }
  const result = validateCouponSync(code, orderTotal, email)
  if (!result.valid) return { valid: false, error: result.error }
  return {
    valid: true,
    code: result.coupon!.code,
    discountAmount: result.discountAmount,
    type: result.coupon!.type,
    value: result.coupon!.value,
  }
}

// ─── Admin: create a coupon ───────────────────────────────────────────────────

export async function adminCreateCoupon(data: {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minOrderAmount: number
  maxUses: number
  expiresAt: string | null
}): Promise<{ success: boolean; error?: string }> {
  if (!(await verifyAdminSession())) return { success: false, error: 'Unauthorized' }

  const code = data.code.toUpperCase().trim()
  if (!code) return { success: false, error: 'Coupon code is required.' }

  const coupons = readCoupons()
  if (coupons.some(c => c.code === code)) {
    return { success: false, error: 'A coupon with this code already exists.' }
  }

  const newCoupon: Coupon = {
    id: crypto.randomUUID(),
    code,
    type: data.type,
    value: data.value,
    minOrderAmount: data.minOrderAmount,
    maxUses: data.maxUses,
    usedCount: 0,
    usedByEmails: [],
    active: true,
    expiresAt: data.expiresAt || null,
    createdAt: new Date().toISOString(),
  }

  try {
    writeCoupons([...coupons, newCoupon])
    revalidatePath('/admin/coupons')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to save coupon (read-only filesystem).' }
  }
}

// ─── Admin: toggle active / inactive ─────────────────────────────────────────

export async function adminToggleCoupon(
  id: string,
  active: boolean,
): Promise<{ success: boolean; error?: string }> {
  if (!(await verifyAdminSession())) return { success: false, error: 'Unauthorized' }

  const coupons = readCoupons()
  try {
    writeCoupons(coupons.map(c => (c.id === id ? { ...c, active } : c)))
    revalidatePath('/admin/coupons')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to update coupon.' }
  }
}

// ─── Admin: delete a coupon ───────────────────────────────────────────────────

export async function adminDeleteCoupon(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  if (!(await verifyAdminSession())) return { success: false, error: 'Unauthorized' }

  const coupons = readCoupons()
  try {
    writeCoupons(coupons.filter(c => c.id !== id))
    revalidatePath('/admin/coupons')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete coupon.' }
  }
}
