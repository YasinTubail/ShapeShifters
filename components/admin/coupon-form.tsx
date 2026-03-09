'use client'

import { useRef, useState, useTransition } from 'react'
import { Loader2, Wand2, Tag, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createCoupon } from '@/app/actions/coupons'

// ── Helper: 8-char random alphanumeric ────────────────────────────────────────
function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function CouponForm() {
  const formRef  = useRef<HTMLFormElement>(null)
  const [code, setCode]   = useState('')
  const [isPending, start] = useTransition()

  function handleAutoGenerate() {
    setCode(generateCode())
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    start(async () => {
      const result = await createCoupon(formData)

      if (result.error) {
        // ── Inline toast for duplicate / validation errors ─────────────────
        toast.error(result.error)
      } else {
        toast.success('Coupon created successfully!')
        formRef.current?.reset()
        setCode('')
      }
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-sm mb-8">
      {/* Card header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50">
        <Plus className="h-4 w-4 text-[#53c87a]" />
        <h2 className="font-bold text-sm uppercase tracking-wide">Create New Coupon</h2>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* ── Discount Code + Auto-Generate ─────────────────────────────── */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
            Discount Code <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              name="code"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER20"
              required
              maxLength={32}
              className="flex-1 min-w-0 border border-gray-300 px-3 py-2 text-sm font-mono uppercase
                         focus:outline-none focus:ring-2 focus:ring-[#53c87a] focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleAutoGenerate}
              title="Auto-generate 8-character code"
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-xs font-medium
                         text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors whitespace-nowrap"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Auto
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Spaces and lowercase are auto-corrected on save.</p>
        </div>

        {/* ── Discount Type ─────────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            name="discountType"
            required
            defaultValue=""
            className="w-full border border-gray-300 px-3 py-2 text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-[#53c87a] focus:border-transparent"
          >
            <option value="" disabled>Select type…</option>
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed amount (₺)</option>
          </select>
        </div>

        {/* ── Discount Value ────────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
            Value <span className="text-red-500">*</span>
          </label>
          <input
            name="discountValue"
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="e.g. 20"
            className="w-full border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#53c87a] focus:border-transparent"
          />
          <p className="text-[10px] text-gray-400 mt-1">Enter 20 for 20% or 50 for ₺50 off.</p>
        </div>

        {/* ── Min Purchase ─────────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
            Min. Purchase (₺)
          </label>
          <input
            name="minPurchase"
            type="number"
            min="0"
            step="0.01"
            defaultValue="0"
            placeholder="0"
            className="w-full border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#53c87a] focus:border-transparent"
          />
          <p className="text-[10px] text-gray-400 mt-1">0 = no minimum required.</p>
        </div>

        {/* ── Max Uses ─────────────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
            Max Uses
          </label>
          <input
            name="maxUses"
            type="number"
            min="1"
            step="1"
            placeholder="Unlimited"
            className="w-full border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#53c87a] focus:border-transparent"
          />
          <p className="text-[10px] text-gray-400 mt-1">Leave blank for unlimited uses.</p>
        </div>

        {/* ── Checkboxes ───────────────────────────────────────────────── */}
        <div className="flex flex-col justify-center gap-3 pt-2 sm:pt-0">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 accent-[#53c87a] cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700">Active on creation</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              name="oneTimePerUser"
              type="checkbox"
              className="h-4 w-4 accent-[#53c87a] cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700">One-time per user</span>
          </label>
        </div>

        {/* ── Submit ───────────────────────────────────────────────────── */}
        <div className="sm:col-span-2 lg:col-span-3 flex justify-end border-t border-gray-100 pt-4 mt-1">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 bg-[#53c87a] text-[#01301e] font-bold text-sm
                       px-6 py-2.5 hover:bg-[#53c87a]/90 disabled:opacity-60 transition-colors"
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
            ) : (
              <><Tag className="h-4 w-4" /> Create Coupon</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
