'use client'

import { useState, useEffect, useTransition } from 'react'
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  adminCreateCoupon,
  adminToggleCoupon,
  adminDeleteCoupon,
} from '@/app/actions/coupons'
import type { Coupon } from '@/lib/server-coupons'

// ─── Fetch helper (client-side) ───────────────────────────────────────────────
async function fetchCoupons(): Promise<Coupon[]> {
  const res = await fetch('/api/admin/coupons', { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

// ─── Blank form ───────────────────────────────────────────────────────────────
const blankForm = {
  code: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: 10,
  minOrderAmount: 0,
  maxUses: 0,
  expiresAt: '',
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blankForm)
  const [formError, setFormError] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    fetchCoupons().then(data => { setCoupons(data); setLoading(false) })
  }, [])

  function refreshCoupons() {
    fetchCoupons().then(setCoupons)
  }

  // ── Create ──────────────────────────────────────────────────────────────────
  function handleCreate() {
    setFormError('')
    startTransition(async () => {
      const result = await adminCreateCoupon({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount),
        maxUses: Number(form.maxUses),
        expiresAt: form.expiresAt || null,
      })
      if (!result.success) {
        setFormError(result.error ?? 'Unknown error')
        return
      }
      setShowForm(false)
      setForm(blankForm)
      refreshCoupons()
    })
  }

  // ── Toggle ──────────────────────────────────────────────────────────────────
  function handleToggle(id: string, active: boolean) {
    startTransition(async () => {
      await adminToggleCoupon(id, active)
      refreshCoupons()
    })
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  function handleDelete(id: string, code: string) {
    if (!confirm(`Delete coupon "${code}"? This cannot be undone.`)) return
    startTransition(async () => {
      await adminDeleteCoupon(id)
      refreshCoupons()
    })
  }

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="h-6 w-6 text-[#53c87a]" />
            Discount Coupons
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage promotional codes for your store.
          </p>
        </div>
        <Button
          onClick={() => { setShowForm(true); setFormError('') }}
          className="bg-[#53c87a] text-[#01301e] hover:bg-[#53c87a]/90 font-bold"
        >
          <Plus className="h-4 w-4 mr-1" /> New Coupon
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mb-8 border border-border bg-card p-6">
          <h2 className="font-bold text-lg mb-4">New Coupon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="text-xs font-medium uppercase tracking-wide mb-1 block">Code *</label>
              <input
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SUMMER20"
                className="w-full border border-border bg-background px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#53c87a]"
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-xs font-medium uppercase tracking-wide mb-1 block">Type *</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as 'percentage' | 'fixed' }))}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#53c87a]"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount (₺)</option>
              </select>
            </div>

            {/* Value */}
            <div>
              <label className="text-xs font-medium uppercase tracking-wide mb-1 block">
                Value * {form.type === 'percentage' ? '(%)' : '(₺)'}
              </label>
              <input
                type="number"
                min={1}
                max={form.type === 'percentage' ? 100 : undefined}
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#53c87a]"
              />
            </div>

            {/* Min order */}
            <div>
              <label className="text-xs font-medium uppercase tracking-wide mb-1 block">Min. Order (₺)</label>
              <input
                type="number"
                min={0}
                value={form.minOrderAmount}
                onChange={e => setForm(f => ({ ...f, minOrderAmount: Number(e.target.value) }))}
                placeholder="0 = no minimum"
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#53c87a]"
              />
            </div>

            {/* Max uses */}
            <div>
              <label className="text-xs font-medium uppercase tracking-wide mb-1 block">Max Uses</label>
              <input
                type="number"
                min={0}
                value={form.maxUses}
                onChange={e => setForm(f => ({ ...f, maxUses: Number(e.target.value) }))}
                placeholder="0 = unlimited"
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#53c87a]"
              />
            </div>

            {/* Expires */}
            <div>
              <label className="text-xs font-medium uppercase tracking-wide mb-1 block">Expires At</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#53c87a]"
              />
            </div>
          </div>

          {formError && (
            <p className="mt-3 text-sm text-destructive flex items-center gap-1">
              <XCircle className="h-4 w-4" /> {formError}
            </p>
          )}

          <div className="flex gap-3 mt-5">
            <Button
              onClick={handleCreate}
              disabled={isPending || !form.code}
              className="bg-[#53c87a] text-[#01301e] hover:bg-[#53c87a]/90 font-bold"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Coupon'}
            </Button>
            <Button
              variant="outline"
              onClick={() => { setShowForm(false); setForm(blankForm); setFormError('') }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Coupons table */}
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading coupons…
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border">
          <Tag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No coupons yet. Create your first one!</p>
        </div>
      ) : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">Code</th>
                <th className="text-left px-4 py-3 font-medium">Discount</th>
                <th className="text-left px-4 py-3 font-medium">Min Order</th>
                <th className="text-left px-4 py-3 font-medium">Uses</th>
                <th className="text-left px-4 py-3 font-medium">Expires</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map(coupon => {
                const expired = !!coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
                const maxed = coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses
                return (
                  <tr key={coupon.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold tracking-wide">{coupon.code}</td>
                    <td className="px-4 py-3">
                      <span className="bg-[#53c87a]/15 text-[#0b6e4f] px-2 py-0.5 text-xs font-bold">
                        {coupon.type === 'percentage'
                          ? `${coupon.value}% OFF`
                          : `₺${coupon.value} OFF`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {coupon.minOrderAmount > 0 ? `₺${coupon.minOrderAmount.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {coupon.usedCount}
                      {coupon.maxUses > 0 ? ` / ${coupon.maxUses}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      {coupon.expiresAt ? (
                        <span className={expired ? 'text-destructive' : 'text-muted-foreground'}>
                          {new Date(coupon.expiresAt).toLocaleDateString('tr-TR')}
                          {expired && ' (expired)'}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {coupon.active && !expired && !maxed ? (
                        <span className="flex items-center gap-1 text-[#0b6e4f] text-xs font-medium">
                          <CheckCircle className="h-3.5 w-3.5" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground text-xs font-medium">
                          <XCircle className="h-3.5 w-3.5" />
                          {maxed ? 'Maxed out' : expired ? 'Expired' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleToggle(coupon.id, !coupon.active)}
                          disabled={isPending}
                          title={coupon.active ? 'Deactivate' : 'Activate'}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {coupon.active
                            ? <ToggleRight className="h-5 w-5 text-[#53c87a]" />
                            : <ToggleLeft className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id, coupon.code)}
                          disabled={isPending}
                          title="Delete"
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
