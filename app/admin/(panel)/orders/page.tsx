import { getStripe } from '@/lib/stripe'
import { readFulfillments } from '@/lib/server-fulfillments'
import { getCODOrders } from '@/app/actions/cod'
import { OrdersTable, type OrderWithFulfillment } from '@/components/admin/orders-table'
import type { FulfillmentStatus } from '@/lib/server-fulfillments'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Orders | Admin' }

async function fetchAllOrders(): Promise<OrderWithFulfillment[]> {
  const fulfillments = readFulfillments()

  // ── Stripe orders ────────────────────────────────────────────────────────
  let stripeOrders: OrderWithFulfillment[] = []
  try {
    const stripe = getStripe()
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ['data.line_items'],
    })

    stripeOrders = sessions.data.map((s) => {
      const fulfillment = fulfillments.find(f => f.id === s.id) ?? null
      const couponCode  = (s.metadata as Record<string, string>)?.coupon_code ?? undefined

      return {
        id:      s.id,
        shortId: s.id.slice(-8).toUpperCase(),
        email:   s.customer_details?.email ?? '—',
        name:    s.customer_details?.name  ?? '—',
        amount:  (s.amount_total ?? 0) / 100,
        currency: s.currency?.toUpperCase() ?? 'TRY',
        status:   s.payment_status,
        date: new Date(s.created * 1000).toLocaleDateString('tr-TR', {
          year: 'numeric', month: 'short', day: 'numeric',
        }),
        couponCode,
        items: (s.line_items?.data ?? []).map(i => ({
          name:   i.description ?? '—',
          qty:    i.quantity ?? 1,
          amount: (i.amount_total ?? 0) / 100,
        })),
        shipping: s.collected_information?.shipping_details?.address
          ? [
              s.collected_information.shipping_details.address.line1,
              s.collected_information.shipping_details.address.city,
              s.collected_information.shipping_details.address.postal_code,
              s.collected_information.shipping_details.address.country,
            ].filter(Boolean).join(', ')
          : '—',
        paymentMethod: 'STRIPE',
        fulfillment: fulfillment
          ? {
              status:          fulfillment.status as FulfillmentStatus,
              trackingNumber:  fulfillment.trackingNumber,
              trackingCarrier: fulfillment.trackingCarrier,
              notes:           fulfillment.notes,
              updatedAt:       fulfillment.updatedAt,
            }
          : null,
      } satisfies OrderWithFulfillment
    })
  } catch {
    // Stripe unavailable — continue with COD only
  }

  // ── COD orders (Prisma) ──────────────────────────────────────────────────
  const codRaw = await getCODOrders()
  const codOrders: OrderWithFulfillment[] = codRaw.map((o) => {
    const fulfillment = fulfillments.find(f => f.id === o.id) ?? null

    const shipping = [
      o.shippingLine1,
      o.shippingLine2,
      o.shippingCity,
      o.shippingPostal,
    ].filter(Boolean).join(', ')

    return {
      id:       o.id,
      shortId:  `C${o.id.slice(-7).toUpperCase()}`,
      email:    o.customerEmail ?? '—',
      name:     o.customerName,
      amount:   o.totalAmount,
      currency: 'TRY',
      // normalise to the same shape used by Stripe: 'paid' | 'pending'
      status:   o.paymentStatus === 'PAID' ? 'paid' : 'pending',
      date: new Date(o.createdAt).toLocaleDateString('tr-TR', {
        year: 'numeric', month: 'short', day: 'numeric',
      }),
      couponCode:    o.couponCode ?? undefined,
      items: o.items.map(i => ({
        name:   `${i.name} (${i.size})`,
        qty:    i.quantity,
        amount: i.price * i.quantity,
      })),
      shipping,
      paymentMethod: 'COD',
      fulfillment: fulfillment
        ? {
            status:          fulfillment.status as FulfillmentStatus,
            trackingNumber:  fulfillment.trackingNumber,
            trackingCarrier: fulfillment.trackingCarrier,
            notes:           fulfillment.notes,
            updatedAt:       fulfillment.updatedAt,
          }
        : null,
    } satisfies OrderWithFulfillment
  })

  // ── Merge + sort newest first ────────────────────────────────────────────
  return [...stripeOrders, ...codOrders].sort((a, b) => {
    // dates are locale strings — compare by original index order instead;
    // COD orders are already sorted newest-first from Prisma, Stripe from API.
    // Simple: put them together as-is (Stripe newest-first, then COD newest-first).
    return 0
  })
}

export default async function AdminOrdersPage() {
  const orders       = await fetchAllOrders()
  const paidCount    = orders.filter(o => o.status === 'paid').length
  const totalRevenue = orders
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + o.amount, 0)
  const codPending = orders.filter(
    o => o.paymentMethod === 'COD' && o.status !== 'paid'
  ).length

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            {orders.length} total · {paidCount} paid
            {codPending > 0 && (
              <span className="ml-2 text-amber-600 font-medium">
                · {codPending} COD awaiting cash
              </span>
            )}
            {' · '}Revenue:{' '}
            <span className="font-semibold text-gray-900">
              ₺{totalRevenue.toLocaleString('tr-TR')}
            </span>
          </p>
        </div>
      </div>
      <OrdersTable orders={orders} />
    </div>
  )
}
