'use server'

import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { getProducts } from '@/lib/server-products'
import { validateCouponSync } from '@/lib/server-coupons'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  selectedSize: string
}

export async function startCheckoutSession(
  cartItems: CartItem[],
  couponCode?: string,
): Promise<string | null> {
  try {
    // ── Big Three check #1: Environment variable ───────────────────────────────
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[CHECKOUT_CRASH]: STRIPE_SECRET_KEY is not configured in environment variables.')
      throw new Error('Payment system is not configured. Please contact support.')
    }

    // ── Big Three check #3: Cart data passed from client as parameter ──────────
    // cartItems is passed explicitly from the client — server never reads browser state.
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Your cart is empty.')
    }

    const products = getProducts()

    // ── Coupon validation (server-side, authoritative) ─────────────────────────
    let discountMultiplier = 1
    let appliedCouponCode: string | undefined

    if (couponCode?.trim()) {
      const orderTotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      )
      const couponResult = validateCouponSync(couponCode, orderTotal)
      if (couponResult.valid && couponResult.discountAmount) {
        discountMultiplier = 1 - couponResult.discountAmount / orderTotal
        appliedCouponCode = couponResult.coupon!.code
      }
    }

    // ── Build Stripe line items ────────────────────────────────────────────────
    const lineItems = cartItems.map((item) => {
      const product = products.find((p) => p.id === item.id)
      if (!product) {
        throw new Error(`Product "${item.name}" is no longer available.`)
      }

      // ── Big Three check #2: Stripe math — multiply by 100 for kuruş ──────────
      // product.price is stored in TRY (e.g. 3290). Stripe expects integer kuruş.
      const discountedUnitAmount = Math.round(product.price * 100 * discountMultiplier)

      if (discountedUnitAmount < 50) {
        // Stripe minimum is 50 kuruş (0.50 TRY)
        throw new Error(`Item price is below the minimum allowed amount.`)
      }

      return {
        price_data: {
          currency: 'try',
          product_data: {
            name: product.name,
            description: appliedCouponCode
              ? `Size: ${item.selectedSize} (Coupon: ${appliedCouponCode})`
              : `Size: ${item.selectedSize}`,
          },
          unit_amount: discountedUnitAmount,
        },
        quantity: item.quantity,
      }
    })

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000')

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      redirect_on_completion: 'if_required',
      return_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      line_items: lineItems,
      mode: 'payment',
      customer_creation: 'always',
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ['TR'] },
      metadata: {
        order_source: 'shapeshifters_web',
        ...(appliedCouponCode ? { coupon_code: appliedCouponCode } : {}),
      },
      custom_text: {
        submit: { message: 'A receipt will be sent to your email after purchase.' },
      },
    })

    return session.client_secret

  } catch (error) {
    // Log the real error server-side so it shows in Vercel logs / local terminal
    console.error('[CHECKOUT_CRASH]:', error)

    // Re-throw a clean message to the client (hides internal details)
    const message =
      error instanceof Error ? error.message : 'Failed to initialize checkout.'
    throw new Error(message)
  }
}

// ── Retrieve session details for the success page ─────────────────────────────

export async function getCheckoutSession(sessionId: string) {
  if (!sessionId) throw new Error('Session ID is required')

  try {
    const stripe = getStripe()
    const session = (await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'payment_intent'],
    })) as Stripe.Checkout.Session

    return {
      id: session.id,
      customerEmail: session.customer_details?.email || null,
      customerName: session.customer_details?.name || null,
      amountTotal: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency,
      paymentStatus: session.payment_status,
      lineItems:
        session.line_items?.data.map((item) => ({
          name: item.description,
          quantity: item.quantity,
          amount: item.amount_total ? item.amount_total / 100 : 0,
        })) || [],
      shippingAddress:
        session.collected_information?.shipping_details?.address || null,
      createdAt: new Date(session.created * 1000).toISOString(),
    }
  } catch (error) {
    console.error('[CHECKOUT_SESSION_FETCH_CRASH]:', error)
    throw new Error('Failed to retrieve order details.')
  }
}
