'use client'

import { useTransition } from 'react'
import { CheckCircle2, XCircle, Loader2, Trash2, Tag, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import type { Coupon } from '@prisma/client'
import { toggleCoupon, deleteCoupon } from '@/app/actions/coupons'

// ── Badge helpers ─────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const isPercentage = type === 'PERCENTAGE'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide
      ${isPercentage ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
      {isPercentage ? '%' : '₺'}
    </span>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0b6e4f] bg-[#53c87a]/15 px-2 py-0.5 uppercase tracking-wide">
      <CheckCircle2 className="h-3 w-3" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 uppercase tracking-wide">
      <XCircle className="h-3 w-3" /> Inactive
    </span>
  )
}

// ── Row actions ───────────────────────────────────────────────────────────────

function CouponRow({ coupon }: { coupon: Coupon }) {
  const [isPending, start] = useTransition()

  function handleToggle() {
    start(async () => {
      const result = await toggleCoupon(coupon.id)
      if (result.error) toast.error(result.error)
      else toast.success(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'}.`)
    })
  }

  function handleDelete() {
    if (!confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return
    start(async () => {
      const result = await deleteCoupon(coupon.id)
      if (result.error) toast.error(result.error)
      else toast.success(`Coupon "${coupon.code}" deleted.`)
    })
  }

  const usageLabel =
    coupon.maxUses !== null
      ? `${coupon.usedCount} / ${coupon.maxUses}`
      : `${coupon.usedCount} / ∞`

  const valueLabel =
    coupon.discountType === 'PERCENTAGE'
      ? `${coupon.discountValue}%`
      : `₺${coupon.discountValue.toLocaleString('tr-TR')}`

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Code */}
      <td className="px-4 py-3">
        <span className="font-mono font-bold text-sm tracking-wide flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-[#53c87a] shrink-0" />
          {coupon.code}
        </span>
        {coupon.minPurchase > 0 && (
          <p className="text-[10px] text-gray-400 mt-0.5 ml-5">
            Min. ₺{coupon.minPurchase.toLocaleString('tr-TR')}
          </p>
        )}
      </td>

      {/* Type + Value */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <TypeBadge type={coupon.discountType} />
          <span className="font-bold text-sm">{valueLabel}</span>
        </div>
      </td>

      {/* Usage */}
      <td className="px-4 py-3 text-sm font-mono text-gray-700 whitespace-nowrap">
        {usageLabel}
        {coupon.maxUses !== null && (
          <div className="w-20 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-[#53c87a] rounded-full transition-all"
              style={{ width: `${Math.min(100, (coupon.usedCount / coupon.maxUses) * 100)}%` }}
            />
          </div>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge active={coupon.isActive} />
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {/* ── Kill-switch toggle ─────────────────────────────── */}
          <button
            onClick={handleToggle}
            disabled={isPending}
            title={coupon.isActive ? 'Deactivate coupon' : 'Activate coupon'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold border transition-colors
              disabled:opacity-50
              ${coupon.isActive
                ? 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100'
                : 'border-[#53c87a] text-[#0b6e4f] bg-[#53c87a]/10 hover:bg-[#53c87a]/20'
              }`}
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : coupon.isActive ? (
              <><ToggleRight className="h-3.5 w-3.5" /> Disable</>
            ) : (
              <><ToggleLeft className="h-3.5 w-3.5" /> Enable</>
            )}
          </button>

          {/* ── Delete ───────────────────────────────────────── */}
          <button
            onClick={handleDelete}
            disabled={isPending}
            title="Delete coupon"
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent
                       hover:border-red-200 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Main table ────────────────────────────────────────────────────────────────

export function CouponTable({ coupons }: { coupons: Coupon[] }) {
  if (coupons.length === 0) {
    return (
      <div className="border border-dashed border-gray-200 py-16 text-center">
        <Tag className="h-10 w-10 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No coupons yet.</p>
        <p className="text-sm text-gray-400 mt-1">Create your first coupon above.</p>
      </div>
    )
  }

  const active   = coupons.filter(c => c.isActive).length
  const inactive = coupons.length - active

  return (
    <div>
      {/* Stats row */}
      <div className="flex items-center gap-6 text-sm mb-4">
        <span className="text-gray-500">
          <span className="font-bold text-gray-900">{coupons.length}</span> total
        </span>
        {active > 0 && (
          <span className="text-[#0b6e4f] font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />{active} active
          </span>
        )}
        {inactive > 0 && (
          <span className="text-gray-400 font-medium">
            <XCircle className="h-3.5 w-3.5 inline mr-1" />{inactive} inactive
          </span>
        )}
      </div>

      <div className="border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Code</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Type / Value</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Used / Max</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {coupons.map(coupon => (
              <CouponRow key={coupon.id} coupon={coupon} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
