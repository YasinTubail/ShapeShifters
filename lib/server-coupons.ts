/**
 * server-coupons.ts
 *
 * Thin server-only wrapper used by app/actions/stripe.ts during checkout.
 * All coupon logic now lives in the Prisma-backed app/actions/coupons.ts.
 * This module re-exports what stripe.ts needs so it can stay async-clean.
 */
import 'server-only'
import { db } from '@/lib/db'

export interface CouponValidationResult {
  valid: boolean
  discountAmount?: number
  coupon?: { code: string }
}

/**
 * Async coupon validation for the checkout server action.
 * Replaces the old synchronous validateCouponSync() call.
 */
export async function validateCouponForCheckout(
  code: string,
  orderTotal: number,
): Promise<CouponValidationResult> {
  const normalizedCode = code.trim().toUpperCase()
  if (!normalizedCode) return { valid: false }

  const coupon = await db.coupon.findUnique({ where: { code: normalizedCode } })

  if (!coupon || !coupon.isActive) return { valid: false }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return { valid: false }
  if (orderTotal < coupon.minPurchase) return { valid: false }

  const discountAmount =
    coupon.discountType === 'PERCENTAGE'
      ? (orderTotal * coupon.discountValue) / 100
      : Math.min(coupon.discountValue, orderTotal)

  return { valid: true, discountAmount, coupon: { code: coupon.code } }
}
