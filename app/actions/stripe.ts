'use server'

import { stripe } from '../../lib/stripe'
import { products } from '../../lib/products'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  selectedSize: string
}

export async function startCheckoutSession(cartItems: CartItem[]) {
  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cart is empty')
  }

  // Validate all items exist and map to line items
  const lineItems = cartItems.map((item) => {
    const product = products.find((p) => p.id === item.id)
    if (!product) {
      throw new Error(`Product with id "${item.id}" not found`)
    }

    // Use the server-side price for security (TRY currency)
    return {
      price_data: {
        currency: 'try',
        product_data: {
          name: product.name,
          description: `Size: ${item.selectedSize}`,
        },
        unit_amount: product.price * 100, // Convert to kuruş (TRY subunit)
      },
      quantity: item.quantity,
    }
  })

  // Get the base URL from environment or construct from headers
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  // Create Checkout Session with customer email collection for receipts
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'if_required',
    return_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    line_items: lineItems,
    mode: 'payment',
    // Collect customer email for receipts
    customer_creation: 'always',
    // Enable phone number collection for shipping
    phone_number_collection: {
      enabled: true,
    },
    shipping_address_collection: {
      allowed_countries: ['TR'],
    },
    // Store metadata for webhook processing
    metadata: {
      order_source: 'shapeshifters_web',
    },
    // Automatic tax is handled by Stripe
    invoice_creation: {
      enabled: true,
      invoice_data: {
        description: 'SHAPESHIFTERS Order',
        metadata: {
          order_source: 'shapeshifters_web',
        },
        footer: 'Thank you for shopping with SHAPESHIFTERS!',
      },
    },
    // Custom text shown during checkout
    custom_text: {
      submit: {
        message: 'A receipt will be sent to your email after purchase.',
      },
    },
  })

  return session.client_secret
}

// Retrieve session details for the success page
export async function getCheckoutSession(sessionId: string) {
  if (!sessionId) {
    throw new Error('Session ID is required')
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'customer', 'payment_intent'],
  })

  return {
    id: session.id,
    customerEmail: session.customer_details?.email || null,
    customerName: session.customer_details?.name || null,
    amountTotal: session.amount_total ? session.amount_total / 100 : 0,
    currency: session.currency,
    paymentStatus: session.payment_status,
    lineItems: session.line_items?.data.map((item) => ({
      name: item.description,
      quantity: item.quantity,
      amount: item.amount_total ? item.amount_total / 100 : 0,
    })) || [],
    shippingAddress: session.shipping_details?.address || null,
    createdAt: new Date(session.created * 1000).toISOString(),
  }
}
