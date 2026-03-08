import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sendOrderConfirmationEmail } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Only process if payment was successful
    if (session.payment_status === 'paid') {
      try {
        // Retrieve full session details with line items
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items', 'customer'],
        })

        const customerEmail = fullSession.customer_details?.email
        const customerName = fullSession.customer_details?.name || 'Valued Customer'

        if (customerEmail) {
          // Generate order ID
          const orderId = `SS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

          // Prepare order details for email
          const orderDetails = {
            orderId,
            customerName,
            customerEmail,
            items: fullSession.line_items?.data.map((item) => ({
              name: item.description || 'Product',
              quantity: item.quantity || 1,
              price: (item.amount_total || 0) / 100,
            })) || [],
            subtotal: (fullSession.amount_subtotal || 0) / 100,
            shipping: 0, // Free shipping or calculate based on your logic
            total: (fullSession.amount_total || 0) / 100,
            currency: fullSession.currency?.toUpperCase() || 'TRY',
            shippingAddress: fullSession.shipping_details?.address ? {
              line1: fullSession.shipping_details.address.line1 || '',
              line2: fullSession.shipping_details.address.line2 || '',
              city: fullSession.shipping_details.address.city || '',
              state: fullSession.shipping_details.address.state || '',
              postalCode: fullSession.shipping_details.address.postal_code || '',
              country: fullSession.shipping_details.address.country || 'TR',
            } : null,
            orderDate: new Date().toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          }

          // Send confirmation email
          await sendOrderConfirmationEmail(orderDetails)

          console.log(`Order confirmation email sent to ${customerEmail} for order ${orderId}`)
        }
      } catch (error) {
        console.error('Error processing checkout.session.completed:', error)
        // Don't return error - we still want to acknowledge the webhook
      }
    }
  }

  // Handle payment_intent.succeeded for additional confirmation
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    console.log(`PaymentIntent ${paymentIntent.id} succeeded`)
  }

  // Return 200 to acknowledge receipt of the event
  return NextResponse.json({ received: true })
}
