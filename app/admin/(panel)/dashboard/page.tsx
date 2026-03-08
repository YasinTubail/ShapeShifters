import Link from 'next/link'
import { Package, ShoppingBag, Layers, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import { getProducts, getCollections } from '@/lib/server-products'
import { getStripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

async function getOrderStats() {
  try {
    const stripe = getStripe()
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      status: 'complete',
    })

    const totalRevenue = sessions.data.reduce((sum, s) => sum + (s.amount_total ?? 0), 0) / 100
    const totalOrders = sessions.data.length
    const recentOrders = sessions.data.slice(0, 5).map((s) => ({
      id: s.id,
      amount: (s.amount_total ?? 0) / 100,
      currency: s.currency?.toUpperCase() ?? 'TRY',
      email: s.customer_details?.email ?? '—',
      date: new Date(s.created * 1000).toLocaleDateString('tr-TR'),
      status: s.payment_status,
    }))

    return { totalRevenue, totalOrders, recentOrders }
  } catch {
    return { totalRevenue: 0, totalOrders: 0, recentOrders: [] }
  }
}

export default async function AdminDashboard() {
  const products = getProducts()
  const collections = getCollections()
  const { totalRevenue, totalOrders, recentOrders } = await getOrderStats()

  const activeProducts = products.filter((p) => p.active !== false).length
  const activeCollections = collections.filter((c) => c.active !== false).length

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      sub: `${activeProducts} active`,
      icon: Package,
      href: '/admin/products',
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      sub: 'Completed payments',
      icon: ShoppingBag,
      href: '/admin/orders',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Total Revenue',
      value: `₺${totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}`,
      sub: 'From Stripe',
      icon: TrendingUp,
      href: '/admin/orders',
      color: 'bg-purple-50 text-purple-700',
    },
    {
      label: 'Collections',
      value: collections.length,
      sub: `${activeCollections} active`,
      icon: Layers,
      href: '/admin/collections',
      color: 'bg-orange-50 text-orange-700',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back. Here&apos;s what&apos;s happening with your store.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-white border border-gray-100 p-6 hover:border-gray-200 transition-colors group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-[#0b6e4f] hover:text-[#01301e] flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.email}</p>
                    <p className="text-xs text-gray-400">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ₺{order.amount.toLocaleString('tr-TR')}
                    </p>
                    <span className="inline-block text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-3">
            <Link
              href="/admin/products/new"
              className="flex items-center gap-3 px-4 py-3 bg-[#01301e] text-white hover:bg-[#0b6e4f] transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Add New Product</span>
            </Link>
            <Link
              href="/admin/collections"
              className="flex items-center gap-3 px-4 py-3 border border-gray-200 text-gray-700 hover:border-gray-300 transition-colors"
            >
              <Layers className="h-4 w-4" />
              <span className="text-sm font-medium">Manage Collections</span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 px-4 py-3 border border-gray-200 text-gray-700 hover:border-gray-300 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="text-sm font-medium">View All Orders</span>
            </Link>
            <Link
              href="/shop"
              target="_blank"
              className="flex items-center gap-3 px-4 py-3 border border-gray-200 text-gray-700 hover:border-gray-300 transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
              <span className="text-sm font-medium">Open Store</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
