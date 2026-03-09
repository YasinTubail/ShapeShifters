'use client'

import React, { useState, useTransition } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Truck,
  Clock,
  Package,
  CheckCircle2,
  Banknote,
  CreditCard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { adminUpdateFulfillment } from '@/app/actions/fulfillments'
import { markCODPaid } from '@/app/actions/cod'
import type { FulfillmentStatus } from '@/lib/server-fulfillments'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderWithFulfillment {
  id: string
  shortId: string
  email: string
  name: string
  amount: number
  currency: string
  status: string
  date: string
  couponCode?: string
  items: { name: string; qty: number; amount: number }[]
  shipping: string
  paymentMethod: 'STRIPE' | 'COD'
  fulfillment: {
    status: FulfillmentStatus
    trackingNumber: string
    trackingCarrier: string
    notes: string
    updatedAt: string
  } | null
}

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<FulfillmentStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:    { label: 'Pending',    color: 'bg-gray-100 text-gray-600',       icon: Clock       },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700',       icon: Package     },
  shipped:    { label: 'Shipped',    color: 'bg-amber-100 text-amber-700',     icon: Truck       },
  delivered:  { label: 'Delivered',  color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
}

function FulfillmentBadge({ status }: { status: FulfillmentStatus }) {
  const cfg  = STATUS_CONFIG[status]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 font-medium ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}

// ─── Mark COD as Received button ─────────────────────────────────────────────

function MarkReceivedButton({
  orderId,
  onSuccess,
}: {
  orderId: string
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await markCODPaid(orderId)
      if ('success' in result && result.success) {
        toast.success('Cash received — order marked as paid.')
        onSuccess()
      } else {
        toast.error(('error' in result ? result.error : null) ?? 'Failed to update.')
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 bg-amber-50 border border-amber-200 hover:bg-amber-100 px-2 py-1 transition-colors disabled:opacity-50"
    >
      {isPending
        ? <Loader2 className="h-3 w-3 animate-spin" />
        : <Banknote className="h-3 w-3" />
      }
      Mark Received
    </button>
  )
}

// ─── Fulfillment form (shown when row is expanded) ───────────────────────────

function FulfillmentForm({
  order,
  onDone,
}: {
  order: OrderWithFulfillment
  onDone: (updated: OrderWithFulfillment['fulfillment']) => void
}) {
  const current = order.fulfillment
  const [status,          setStatus]          = useState<FulfillmentStatus>(current?.status ?? 'pending')
  const [trackingNumber,  setTrackingNumber]  = useState(current?.trackingNumber  ?? '')
  const [trackingCarrier, setTrackingCarrier] = useState(current?.trackingCarrier ?? '')
  const [notes,           setNotes]           = useState(current?.notes           ?? '')
  const [isPending,       startTransition]    = useTransition()

  function handleSave() {
    startTransition(async () => {
      const result = await adminUpdateFulfillment({
        sessionId: order.id,
        status,
        trackingNumber,
        trackingCarrier,
        notes,
      })
      if (result.success) {
        toast.success(`Order #${order.shortId} updated to "${STATUS_CONFIG[status].label}".`)
        onDone({
          status,
          trackingNumber,
          trackingCarrier,
          notes,
          updatedAt: new Date().toISOString(),
        })
      } else {
        toast.error(result.error ?? 'Failed to update order.')
      }
    })
  }

  return (
    <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1 block">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as FulfillmentStatus)}
            className="w-full border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#53c87a]"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1 block">Carrier</label>
          <input
            value={trackingCarrier}
            onChange={e => setTrackingCarrier(e.target.value)}
            placeholder="e.g. PTT, Yurtiçi, MNG"
            className="w-full border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#53c87a]"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1 block">Tracking Number</label>
          <input
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value)}
            placeholder="e.g. 1234567890"
            className="w-full border border-gray-200 bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#53c87a]"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1 block">Internal Notes</label>
          <input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Optional notes"
            className="w-full border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#53c87a]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={isPending}
          size="sm"
          className="bg-[#01301e] hover:bg-[#0b6e4f] text-white font-bold"
        >
          {isPending
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Saving…</>
            : 'Save Fulfillment'
          }
        </Button>
        {trackingNumber && trackingCarrier && (
          <span className="text-xs text-gray-500">
            Tracking: <span className="font-mono font-medium">{trackingCarrier} · {trackingNumber}</span>
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Main table ───────────────────────────────────────────────────────────────

export function OrdersTable({ orders: initialOrders }: { orders: OrderWithFulfillment[] }) {
  const [orders,     setOrders]     = useState(initialOrders)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function handleFulfillmentDone(orderId: string, updated: OrderWithFulfillment['fulfillment']) {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, fulfillment: updated } : o)))
  }

  function handleMarkReceived(orderId: string) {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: 'paid' } : o)))
  }

  const paidOrders       = orders.filter(o => o.status === 'paid')
  const pendingFulfillment = paidOrders.filter(
    o => !o.fulfillment || o.fulfillment.status === 'pending'
  ).length

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-gray-100 p-12 text-center">
        <p className="text-gray-400">No orders yet.</p>
        <p className="text-sm text-gray-400 mt-1">Orders appear once customers complete checkout.</p>
      </div>
    )
  }

  return (
    <>
      {pendingFulfillment > 0 && (
        <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-800">
          <Clock className="h-4 w-4 shrink-0" />
          <span>
            <strong>{pendingFulfillment}</strong> paid{' '}
            {pendingFulfillment === 1 ? 'order needs' : 'orders need'} fulfillment.
          </span>
        </div>
      )}

      <div className="bg-white border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Order', 'Customer', 'Items', 'Shipping To', 'Amount', 'Payment', 'Fulfillment', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const isExpanded       = expandedId === order.id
                const fulfillmentStatus: FulfillmentStatus = order.fulfillment?.status ?? 'pending'
                const isCOD            = order.paymentMethod === 'COD'
                const isCODPending     = isCOD && order.status !== 'paid'

                return (
                  <React.Fragment key={order.id}>
                    <tr className={`border-b border-gray-50 transition-colors ${isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50/50'}`}>

                      {/* Order ID + date */}
                      <td className="px-4 py-4">
                        <p className="font-mono text-xs font-medium text-gray-900">#{order.shortId}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{order.date}</p>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900 text-sm">{order.name}</p>
                        <p className="text-xs text-gray-400">{order.email}</p>
                      </td>

                      {/* Items */}
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          {order.items.map((item, i) => (
                            <p key={i} className="text-xs text-gray-600">{item.name} ×{item.qty}</p>
                          ))}
                          {order.couponCode && (
                            <p className="text-xs text-[#0b6e4f] font-medium">🏷 {order.couponCode}</p>
                          )}
                        </div>
                      </td>

                      {/* Shipping */}
                      <td className="px-4 py-4">
                        <p className="text-xs text-gray-600 max-w-[160px] leading-relaxed">{order.shipping}</p>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-4">
                        <p className="font-semibold text-gray-900">₺{order.amount.toLocaleString('tr-TR')}</p>
                      </td>

                      {/* Payment — method badge + status badge */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          {/* Method badge */}
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 font-bold ${
                            isCOD
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-50 text-blue-600'
                          }`}>
                            {isCOD
                              ? <Banknote    className="h-3 w-3" />
                              : <CreditCard  className="h-3 w-3" />
                            }
                            {isCOD ? 'COD' : 'Card'}
                          </span>
                          {/* Status badge */}
                          <span className={`inline-flex items-center text-xs px-2 py-0.5 font-medium ${
                            order.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : isCODPending
                              ? 'bg-yellow-100 text-yellow-700'
                              : order.status === 'unpaid'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {order.status === 'paid'
                              ? 'Paid'
                              : isCODPending
                              ? 'Awaiting Cash'
                              : order.status}
                          </span>
                        </div>
                      </td>

                      {/* Fulfillment status */}
                      <td className="px-4 py-4">
                        {order.status === 'paid'
                          ? <FulfillmentBadge status={fulfillmentStatus} />
                          : <span className="text-xs text-gray-400">—</span>
                        }
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          {isCODPending && (
                            <MarkReceivedButton
                              orderId={order.id}
                              onSuccess={() => handleMarkReceived(order.id)}
                            />
                          )}
                          {order.status === 'paid' && (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : order.id)}
                              className="flex items-center gap-1 text-xs font-medium text-[#0b6e4f] hover:text-[#01301e] transition-colors"
                            >
                              Manage
                              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable fulfillment form */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          <FulfillmentForm
                            order={order}
                            onDone={updated => handleFulfillmentDone(order.id, updated)}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
