'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getProducts } from '@/lib/server-products'
import { validateCouponForCheckout } from '@/lib/server-coupons'
import { verifyAdminSession } from '@/lib/admin-auth'

// ── Types ──────────────────────────────────────────────────────────────────────

interface CODCartItem {
  id: string
  name: string
  price: number
  quantity: number
  selectedSize: string
  color?: string
}

interface PlaceCODInput {
  customerName: string
  customerEmail?: string
  customerPhone: string
  shippingLine1: string
  shippingLine2?: string
  shippingCity: string
  shippingPostal?: string
  notes?: string
  cartItems: CODCartItem[]
  couponCode?: string
}

export type PlaceCODResult =
  | { orderId: string; error?: never }
  | { error: string; orderId?: never }

// ── Place COD Order (customer-facing) ─────────────────────────────────────────

export async function placeCODOrder(input: PlaceCODInput): Promise<PlaceCODResult> {
  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingLine1,
    shippingLine2,
    shippingCity,
    shippingPostal,
    notes,
    cartItems,
    couponCode,
  } = input

  // ── Basic validation ───────────────────────────────────────────────────────
  if (!customerName?.trim())  return { error: 'Ad Soyad gereklidir.' }
  if (!customerPhone?.trim()) return { error: 'Telefon numarası gereklidir.' }
  if (!shippingLine1?.trim()) return { error: 'Adres satırı gereklidir.' }
  if (!shippingCity?.trim())  return { error: 'Şehir gereklidir.' }
  if (!cartItems?.length)     return { error: 'Sepetiniz boş.' }

  // ── Server-side price verification (never trust client prices) ─────────────
  const products = getProducts()
  let subtotal = 0

  const verifiedItems: {
    productId: string
    name: string
    price: number
    quantity: number
    size: string
    color?: string
  }[] = []

  for (const item of cartItems) {
    const product = products.find(p => p.id === item.id)
    if (!product) return { error: `"${item.name}" ürünü artık mevcut değil.` }
    if (item.quantity < 1) return { error: 'Geçersiz ürün miktarı.' }

    subtotal += product.price * item.quantity
    verifiedItems.push({
      productId: item.id,
      name:      product.name,
      price:     product.price,
      quantity:  item.quantity,
      size:      item.selectedSize,
      color:     item.color,
    })
  }

  // ── Coupon discount (server-authoritative) ─────────────────────────────────
  let appliedCouponCode: string | null = null
  let discount = 0

  if (couponCode?.trim()) {
    const couponResult = await validateCouponForCheckout(couponCode, subtotal)
    if (couponResult.valid && couponResult.discountAmount) {
      discount = couponResult.discountAmount
      appliedCouponCode = couponResult.coupon!.code
    }
  }

  // ── Shipping (free over ₺1500) ─────────────────────────────────────────────
  const shippingCost = subtotal >= 1500 ? 0 : 49
  const totalAmount  = Math.max(0, subtotal - discount + shippingCost)

  // ── Create Order in database ───────────────────────────────────────────────
  try {
    const order = await db.order.create({
      data: {
        paymentMethod:   'COD',
        paymentStatus:   'PENDING',
        status:          'PROCESSING',
        customerName:    customerName.trim(),
        customerEmail:   customerEmail?.trim() || null,
        customerPhone:   customerPhone.trim(),
        shippingLine1:   shippingLine1.trim(),
        shippingLine2:   shippingLine2?.trim() || null,
        shippingCity:    shippingCity.trim(),
        shippingPostal:  shippingPostal?.trim() || null,
        shippingCountry: 'TR',
        totalAmount,
        couponCode:      appliedCouponCode,
        notes:           notes?.trim() || null,
        items: {
          create: verifiedItems,
        },
      },
    })

    return { orderId: order.id }
  } catch (error) {
    console.error('[COD_ORDER_ERROR]:', error)
    return { error: 'Sipariş oluşturulamadı. Lütfen tekrar deneyin.' }
  }
}

// ── Get COD Order for success page ────────────────────────────────────────────

export async function getCODOrder(orderId: string) {
  if (!orderId) return null

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })
    return order
  } catch {
    return null
  }
}

// ── Admin: Mark COD order as PAID ─────────────────────────────────────────────

export async function markCODPaid(orderId: string): Promise<{ success: true } | { error: string }> {
  const session = await verifyAdminSession()
  if (!session) return { error: 'Unauthorized.' }

  try {
    await db.order.update({
      where: { id: orderId },
      data:  { paymentStatus: 'PAID', updatedAt: new Date() },
    })
    revalidatePath('/admin/orders')
    return { success: true }
  } catch (error) {
    console.error('[MARK_COD_PAID_ERROR]:', error)
    return { error: 'Failed to update payment status.' }
  }
}

// ── Admin: Get all COD orders ──────────────────────────────────────────────────

export async function getCODOrders() {
  try {
    return await db.order.findMany({
      where:   { paymentMethod: 'COD' },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    return []
  }
}
