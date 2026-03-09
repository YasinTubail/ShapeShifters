'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { verifyAdminSession } from '@/lib/admin-auth'

// ── Types ──────────────────────────────────────────────────────────────────────

export type CouponActionResult =
  | { success: true; error?: never }
  | { error: string; success?: never }

export type ValidateCouponResult =
  | { valid: true; code: string; discountAmount: number; type: string; value: number; error?: never }
  | { valid: false; error: string }

// ── Admin: Create ──────────────────────────────────────────────────────────────

export async function createCoupon(formData: FormData): Promise<CouponActionResult> {
  const session = await verifyAdminSession()
  if (!session) return { error: 'Unauthorized.' }

  // ── Formatting: trim + uppercase (per spec) ───────────────────────────────
  const rawCode = (formData.get('code') as string | null) ?? ''
  const code = rawCode.trim().toUpperCase()

  const discountType   = (formData.get('discountType') as string | null) ?? ''
  const discountValue  = parseFloat((formData.get('discountValue')  as string) ?? '0')
  const minPurchase    = parseFloat((formData.get('minPurchase')    as string) ?? '0') || 0
  const maxUsesRaw     = (formData.get('maxUses') as string | null)?.trim()
  const maxUses        = maxUsesRaw ? parseInt(maxUsesRaw, 10) : null
  const isActive       = formData.get('isActive')       === 'on'
  const oneTimePerUser = formData.get('oneTimePerUser') === 'on'

  // ── Validation ────────────────────────────────────────────────────────────
  if (!code)
    return { error: 'Coupon code is required.' }
  if (code.length < 3 || code.length > 32)
    return { error: 'Code must be between 3 and 32 characters.' }
  if (!['PERCENTAGE', 'FIXED'].includes(discountType))
    return { error: 'Select a valid discount type.' }
  if (isNaN(discountValue) || discountValue <= 0)
    return { error: 'Discount value must be a positive number.' }
  if (discountType === 'PERCENTAGE' && discountValue > 100)
    return { error: 'Percentage discount cannot exceed 100%.' }

  try {
    await db.coupon.create({
      data: { code, discountType, discountValue, minPurchase, maxUses, isActive, oneTimePerUser },
    })
    revalidatePath('/admin/coupons')
    return { success: true }
  } catch (error) {
    // ── P2002 = unique constraint violation → duplicate code ──────────────
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return { error: 'This discount code already exists.' }
    }
    console.error('[CREATE_COUPON_ERROR]:', error)
    return { error: 'Failed to create coupon. Please try again.' }
  }
}

// ── Admin: Toggle isActive (kill-switch) ───────────────────────────────────────

export async function toggleCoupon(id: string): Promise<CouponActionResult> {
  const session = await verifyAdminSession()
  if (!session) return { error: 'Unauthorized.' }

  try {
    const coupon = await db.coupon.findUnique({ where: { id } })
    if (!coupon) return { error: 'Coupon not found.' }

    await db.coupon.update({ where: { id }, data: { isActive: !coupon.isActive } })
    revalidatePath('/admin/coupons')
    return { success: true }
  } catch (error) {
    console.error('[TOGGLE_COUPON_ERROR]:', error)
    return { error: 'Failed to toggle coupon status.' }
  }
}

// ── Admin: Delete ──────────────────────────────────────────────────────────────

export async function deleteCoupon(id: string): Promise<CouponActionResult> {
  const session = await verifyAdminSession()
  if (!session) return { error: 'Unauthorized.' }

  try {
    await db.coupon.delete({ where: { id } })
    revalidatePath('/admin/coupons')
    return { success: true }
  } catch (error) {
    console.error('[DELETE_COUPON_ERROR]:', error)
    return { error: 'Failed to delete coupon.' }
  }
}

// ── Storefront: Validate (called from checkout page + stripe action) ───────────

export async function validateCoupon(
  code: string,
  orderTotal: number,
): Promise<ValidateCouponResult> {
  const normalizedCode = code.trim().toUpperCase()
  if (!normalizedCode) return { valid: false, error: 'Please enter a coupon code.' }

  const coupon = await db.coupon.findUnique({ where: { code: normalizedCode } })

  if (!coupon)
    return { valid: false, error: 'Invalid coupon code.' }
  if (!coupon.isActive)
    return { valid: false, error: 'This coupon is no longer active.' }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
    return { valid: false, error: 'This coupon has reached its usage limit.' }
  if (orderTotal < coupon.minPurchase)
    return {
      valid: false,
      error: `Minimum order of ₺${coupon.minPurchase.toLocaleString('tr-TR')} required.`,
    }

  const discountAmount =
    coupon.discountType === 'PERCENTAGE'
      ? Math.round((orderTotal * coupon.discountValue) / 100 * 100) / 100
      : Math.min(coupon.discountValue, orderTotal)

  return { valid: true, code: coupon.code, discountAmount, type: coupon.discountType, value: coupon.discountValue }
}
