import { getStripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Orders | Admin' }

async function fetchOrders() {
  try {
    const stripe = getStripe()
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ['data.line_items'],
    })

    return sessions.data.map((s) => ({
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
      items: s.line_items?.data.map((i) => ({
        name: i.description ?? '—',
        qty: i.quantity ?? 1,
        amount: (i.amount_total ?? 0) / 100,
      })) ?? [],
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
    }))
  } catch {
    return []
  }
}

export default async function AdminOrdersPage() {
  const orders = await fetchOrders()
  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.amount, 0)

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            {orders.length} total orders · Total revenue:{' '}
            <span className="font-semibold text-gray-900">
              ₺{totalRevenue.toLocaleString('tr-TR')}
            </span>
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-gray-100 p-12 text-center">
          <p className="text-gray-400">No orders yet.</p>
          <p className="text-sm text-gray-400 mt-1">Orders will appear here once customers complete checkout.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Shipping To</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-mono text-xs font-medium text-gray-900">#{order.shortId}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{order.name}</p>
                      <p className="text-xs text-gray-400">{order.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-0.5">
                        {order.items.map((item, i) => (
                          <p key={i} className="text-xs text-gray-600">
                            {item.name} ×{item.qty}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs text-gray-600 max-w-[180px]">{order.shipping}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">
                        ₺{order.amount.toLocaleString('tr-TR')}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center text-xs px-2 py-1 font-medium ${
                        order.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : order.status === 'unpaid'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500 text-xs whitespace-nowrap">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
