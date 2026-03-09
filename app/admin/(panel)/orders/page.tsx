import { getStripe } from '@/lib/stripe'
import { readFulfillments } from '@/lib/server-fulfillments'
import { OrdersTable, type OrderWithFulfillment } from '@/components/admin/orders-table'
import type { FulfillmentStatus } from '@/lib/server-fulfillments'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Orders | Admin' }

async function fetchOrdersWithFulfillment(): Promise<OrderWithFulfillment[]> {
  try {
    const stripe = getStripe()
    const [sessions, fulfillments] = await Promise.all([
      stripe.checkout.sessions.list({ limit: 100, expand: ['data.line_items'] }),
      Promise.resolve(readFulfillments()),
    ])

    return sessions.data.map((s) => {
      const fulfillment = fulfillments.find(f => f.id === s.id) ?? null
      const couponCode = (s.metadata as Record<string, string>)?.coupon_code ?? undefined

      return {
        id: s.id,
        shortId: s.id.slice(-8).toUpperCase(),
        email: s.customer_details?.email ?? '—',
        name: s.customer_details?.name ?? '—',
        amount: (s.amount_total ?? 0) / 100,
        currency: s.currency?.toUpperCase() ?? 'TRY',
        status: s.payment_status,
        date: new Date(s.created * 1000).toLocaleDateString('tr-TR', {
          year: 'numeric', month: 'short', day: 'numeric',
        }),
        couponCode,
        items: (s.line_items?.data ?? []).map(i => ({
          name: i.description ?? '—',
          qty: i.quantity ?? 1,
          amount: (i.amount_total ?? 0) / 100,
        })),
        shipping: s.collected_information?.shipping_details?.address
          ? [
              s.collected_information.shipping_details.address.line1,
              s.collected_information.shipping_details.address.city,
              s.collected_information.shipping_details.address.postal_code,
              s.collected_information.shipping_details.address.country,
            ]
              .filter(Boolean)
              .join(', ')
          : '—',
        fulfillment: fulfillment
          ? {
              status: fulfillment.status as FulfillmentStatus,
              trackingNumber: fulfillment.trackingNumber,
              trackingCarrier: fulfillment.trackingCarrier,
              notes: fulfillment.notes,
              updatedAt: fulfillment.updatedAt,
            }
          : null,
      }
    })
  } catch {
    return []
  }
}

export default async function AdminOrdersPage() {
  const orders = await fetchOrdersWithFulfillment()
  const paidCount = orders.filter(o => o.status === 'paid').length
  const totalRevenue = orders
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + o.amount, 0)

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            {orders.length} total · {paidCount} paid · Revenue:{' '}
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
