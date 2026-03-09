import Link from 'next/link'
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Plus,
  ArrowRight,
  AlertTriangle,
  Tag,
  Truck,
  Clock,
  CheckCircle2,
  Boxes,
} from 'lucide-react'
import { getProducts, getCollections } from '@/lib/server-products'
import { getStripe } from '@/lib/stripe'
import { readFulfillments } from '@/lib/server-fulfillments'
import { readCoupons } from '@/lib/server-coupons'
import { RevenueChart, type ChartDataPoint } from '@/components/admin/revenue-chart'
import type { ProductVariant } from '@/lib/cart-context'

export const dynamic = 'force-dynamic'

// ─── Data helpers ─────────────────────────────────────────────────────────────

async function getDashboardData() {
  try {
    const stripe = getStripe()
    const sessions = await stripe.checkout.sessions.list({ limit: 100, status: 'complete' })

    const paidSessions = sessions.data.filter(s => s.payment_status === 'paid')
    const totalRevenue = paidSessions.reduce((sum, s) => sum + (s.amount_total ?? 0), 0) / 100
    const totalOrders = paidSessions.length

    // Build 14-day chart data
    const now = new Date()
    const cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() - 13)
    cutoff.setHours(0, 0, 0, 0)

    const chartData: ChartDataPoint[] = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(cutoff)
      d.setDate(cutoff.getDate() + i)
      return {
        date: d.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
        revenue: 0,
        orders: 0,
      }
    })

    for (const s of paidSessions) {
      const sessionDate = new Date(s.created * 1000)
      if (sessionDate < cutoff) continue
      const diffDays = Math.floor((sessionDate.getTime() - cutoff.getTime()) / 86400000)
      if (diffDays >= 0 && diffDays < 14) {
        chartData[diffDays].revenue = Math.round((chartData[diffDays].revenue + (s.amount_total ?? 0) / 100) * 100) / 100
        chartData[diffDays].orders += 1
      }
    }

    const recentOrders = paidSessions.slice(0, 6).map(s => ({
      id: s.id,
      shortId: s.id.slice(-8).toUpperCase(),
      amount: (s.amount_total ?? 0) / 100,
      email: s.customer_details?.email ?? '—',
      date: new Date(s.created * 1000).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
    }))

    return { totalRevenue, totalOrders, recentOrders, chartData }
  } catch {
    const chartData: ChartDataPoint[] = Array.from({ length: 14 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (13 - i))
      return { date: d.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }), revenue: 0, orders: 0 }
    })
    return { totalRevenue: 0, totalOrders: 0, recentOrders: [], chartData }
  }
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  const [products, collections, fulfillments, coupons, { totalRevenue, totalOrders, recentOrders, chartData }] =
    await Promise.all([
      Promise.resolve(getProducts()),
      Promise.resolve(getCollections()),
      Promise.resolve(readFulfillments()),
      Promise.resolve(readCoupons()),
      getDashboardData(),
    ])

  const activeProducts = products.filter(p => p.active !== false).length
  const activeCoupons = coupons.filter(c => c.active).length

  // Fulfillment pipeline
  const pendingFulfillment = fulfillments.filter(f => f.status === 'pending').length
  const processing = fulfillments.filter(f => f.status === 'processing').length
  const shipped = fulfillments.filter(f => f.status === 'shipped').length
  const delivered = fulfillments.filter(f => f.status === 'delivered').length

  // Low-stock alerts (stock > 0 && stock <= 5, on products with variants)
  interface LowStockItem { productName: string; color: string; size: string; stock: number }
  const lowStockItems: LowStockItem[] = []
  for (const product of products.filter(p => p.active !== false && p.variants?.length)) {
    for (const variant of (product.variants as ProductVariant[])) {
      for (const sz of variant.sizes) {
        if (sz.stock > 0 && sz.stock <= 5) {
          lowStockItems.push({ productName: product.name, color: variant.color, size: sz.size, stock: sz.stock })
        }
      }
    }
  }
  lowStockItems.sort((a, b) => a.stock - b.stock)

  const stats = [
    {
      label: 'Total Products', value: products.length, sub: `${activeProducts} active`,
      icon: Package, href: '/admin/products', color: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Total Orders', value: totalOrders, sub: 'Paid via Stripe',
      icon: ShoppingBag, href: '/admin/orders', color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Total Revenue',
      value: `₺${totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}`,
      sub: 'All time', icon: TrendingUp, href: '/admin/orders', color: 'bg-purple-50 text-purple-700',
    },
    {
      label: 'Active Coupons', value: activeCoupons, sub: `${coupons.length} total`,
      icon: Tag, href: '/admin/coupons', color: 'bg-orange-50 text-orange-700',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back. Here&apos;s what&apos;s happening with your store.
        </p>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(stat => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white border border-gray-100 p-6 hover:border-gray-200 transition-colors"
          >
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

      {/* ── Revenue chart + Fulfillment pipeline ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 14-day revenue chart */}
        <div className="lg:col-span-2 bg-white border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Revenue — Last 14 Days</h2>
            <Link href="/admin/orders" className="text-xs text-[#0b6e4f] hover:text-[#01301e] flex items-center gap-1">
              View orders <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-4 pt-2 pb-4">
            <RevenueChart data={chartData} />
          </div>
        </div>

        {/* Fulfillment pipeline */}
        <div className="bg-white border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Fulfillment Pipeline</h2>
            <Link href="/admin/orders" className="text-xs text-[#0b6e4f] hover:text-[#01301e] flex items-center gap-1">
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: 'Pending',    count: pendingFulfillment, icon: Clock,        color: 'text-gray-600 bg-gray-100' },
              { label: 'Processing', count: processing,         icon: Package,      color: 'text-blue-700 bg-blue-100' },
              { label: 'Shipped',    count: shipped,            icon: Truck,        color: 'text-amber-700 bg-amber-100' },
              { label: 'Delivered',  count: delivered,          icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-100' },
            ].map(({ label, count, icon: Icon, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded ${color}`}><Icon className="h-3.5 w-3.5" /></span>
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent orders + Low stock ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
              recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{order.email}</p>
                    <p className="text-xs text-gray-400 font-mono">#{order.shortId} · {order.date}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 shrink-0">
                    ₺{order.amount.toLocaleString('tr-TR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              {lowStockItems.length > 0 && <AlertTriangle className="h-4 w-4 text-amber-500" />}
              Low Stock Alerts
            </h2>
            <Link href="/admin/inventory" className="text-xs text-[#0b6e4f] hover:text-[#01301e] flex items-center gap-1">
              Manage stock <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {lowStockItems.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <Boxes className="h-8 w-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">All stocked items look good.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {lowStockItems.slice(0, 10).map((item, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-400">{item.color} · {item.size}</p>
                  </div>
                  <span className={`ml-4 text-xs font-bold px-2 py-1 shrink-0 ${
                    item.stock <= 2 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.stock} left
                  </span>
                </div>
              ))}
              {lowStockItems.length > 10 && (
                <p className="text-xs text-gray-400 text-center px-6 py-3">
                  +{lowStockItems.length - 10} more —{' '}
                  <Link href="/admin/inventory" className="text-[#0b6e4f] underline">see all</Link>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/admin/products/new" className="flex items-center gap-3 px-4 py-3 bg-[#01301e] text-white hover:bg-[#0b6e4f] transition-colors">
            <Plus className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">New Product</span>
          </Link>
          <Link href="/admin/inventory" className="flex items-center gap-3 px-4 py-3 border border-gray-200 text-gray-700 hover:border-gray-300 transition-colors">
            <Package className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">Inventory</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 border border-gray-200 text-gray-700 hover:border-gray-300 transition-colors">
            <ShoppingBag className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">Orders</span>
          </Link>
          <Link href="/admin/coupons" className="flex items-center gap-3 px-4 py-3 border border-gray-200 text-gray-700 hover:border-gray-300 transition-colors">
            <Tag className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">Coupons</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
