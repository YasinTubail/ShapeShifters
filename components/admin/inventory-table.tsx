'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Save, Loader2, CheckCircle2, AlertTriangle, XCircle, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { adminBulkUpdateStock, type StockUpdate } from '@/app/actions/inventory'
import type { ProductWithActive } from '@/lib/server-products'
import type { ProductVariant, VariantSize } from '@/lib/cart-context'
import { toast } from 'sonner'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stockBadge(stock: number) {
  if (stock === 0) return <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1">OOS</span>
  if (stock <= 5) return <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1">LOW</span>
  return null
}

function stockInputClass(original: number, current: number) {
  const changed = original !== current
  const low = current > 0 && current <= 5
  const oos = current === 0
  if (oos) return 'border-red-300 bg-red-50 focus:ring-red-300'
  if (low) return 'border-amber-300 bg-amber-50 focus:ring-amber-300'
  if (changed) return 'border-[#53c87a] bg-[#53c87a]/5 focus:ring-[#53c87a]'
  return 'border-border bg-background focus:ring-[#53c87a]'
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InventoryTable({ products }: { products: ProductWithActive[] }) {
  // Only products with variants are editable
  const variantProducts = products.filter(p => p.variants && p.variants.length > 0)
  const legacyCount = products.length - variantProducts.length

  // stock[productId][variantId][size] = stock number
  const buildInitial = () => {
    const m: Record<string, Record<string, Record<string, number>>> = {}
    for (const product of variantProducts) {
      m[product.id] = {}
      for (const v of (product.variants as ProductVariant[])) {
        m[product.id][v.id] = {}
        for (const sz of v.sizes) {
          m[product.id][v.id][sz.size] = sz.stock
        }
      }
    }
    return m
  }

  const [original] = useState(buildInitial)
  const [current, setCurrent] = useState(buildInitial)
  const [isPending, startTransition] = useTransition()

  function handleChange(productId: string, variantId: string, size: string, val: string) {
    const n = parseInt(val, 10)
    if (isNaN(n) || n < 0) return
    setCurrent(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [variantId]: {
          ...prev[productId]?.[variantId],
          [size]: n,
        },
      },
    }))
  }

  // Collect changed entries
  function getChanges(): StockUpdate[] {
    const changes: StockUpdate[] = []
    for (const productId of Object.keys(current)) {
      for (const variantId of Object.keys(current[productId])) {
        for (const size of Object.keys(current[productId][variantId])) {
          const cur = current[productId][variantId][size]
          const orig = original[productId]?.[variantId]?.[size] ?? cur
          if (cur !== orig) {
            changes.push({ productId, variantId, size, stock: cur })
          }
        }
      }
    }
    return changes
  }

  const hasChanges = getChanges().length > 0

  function handleSave() {
    const changes = getChanges()
    if (!changes.length) return
    startTransition(async () => {
      const result = await adminBulkUpdateStock(changes)
      if (result.success) {
        toast.success(`Saved ${result.updatedCount} stock ${result.updatedCount === 1 ? 'entry' : 'entries'}.`)
      } else {
        toast.error(result.error ?? 'Save failed.')
      }
    })
  }

  // Count totals for header stats
  const totalVariants = variantProducts.reduce(
    (sum, p) => sum + ((p.variants as ProductVariant[])?.length ?? 0), 0
  )
  const lowStockCount = variantProducts.reduce((sum, p) =>
    sum + ((p.variants as ProductVariant[]) ?? []).reduce((vs, v) =>
      vs + v.sizes.filter(sz => {
        const cur = current[p.id]?.[v.id]?.[sz.size] ?? sz.stock
        return cur > 0 && cur <= 5
      }).length, 0
    ), 0
  )
  const oosCount = variantProducts.reduce((sum, p) =>
    sum + ((p.variants as ProductVariant[]) ?? []).reduce((vs, v) =>
      vs + v.sizes.filter(sz => (current[p.id]?.[v.id]?.[sz.size] ?? sz.stock) === 0).length, 0
    ), 0
  )

  return (
    <div>
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-6 text-sm">
          <span className="text-muted-foreground">
            <span className="font-bold text-foreground">{variantProducts.length}</span> products ·{' '}
            <span className="font-bold text-foreground">{totalVariants}</span> variants
          </span>
          {lowStockCount > 0 && (
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <AlertTriangle className="h-4 w-4" />
              {lowStockCount} low stock
            </span>
          )}
          {oosCount > 0 && (
            <span className="flex items-center gap-1 text-red-600 font-medium">
              <XCircle className="h-4 w-4" />
              {oosCount} out of stock
            </span>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isPending}
          className="bg-[#53c87a] text-[#01301e] hover:bg-[#53c87a]/90 font-bold gap-2"
        >
          {isPending
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
            : <><Save className="h-4 w-4" /> Save Changes {hasChanges ? `(${getChanges().length})` : ''}</>
          }
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#53c87a]/20 border border-[#53c87a] inline-block" /> Changed</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-50 border border-amber-300 inline-block" /> Low stock (≤5)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-50 border border-red-300 inline-block" /> Out of stock</span>
      </div>

      {variantProducts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No products with variant data yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Edit a product in the Products section and add Color Variants to enable inventory tracking.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {variantProducts.map(product => {
            const variants = (product.variants as ProductVariant[]) ?? []
            return (
              <div key={product.id} className="border border-border bg-card">
                {/* Product header */}
                <div className="flex items-center gap-4 px-4 py-3 bg-muted/40 border-b border-border">
                  <div className="relative w-10 h-10 bg-muted shrink-0 overflow-hidden">
                    {product.image && (
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category} · #{product.id}</p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {variants.length} {variants.length === 1 ? 'variant' : 'variants'}
                  </span>
                </div>

                {/* Variants */}
                <div className="divide-y divide-border">
                  {variants.map(variant => (
                    <div key={variant.id} className="px-4 py-3">
                      {/* Variant name + color swatch */}
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="w-4 h-4 rounded-full border border-border shrink-0"
                          style={{ backgroundColor: variant.colorHex || '#888' }}
                        />
                        <span className="text-sm font-medium">{variant.color}</span>
                      </div>

                      {/* Size grid */}
                      <div className="flex flex-wrap gap-3">
                        {variant.sizes.map(sz => {
                          const curStock = current[product.id]?.[variant.id]?.[sz.size] ?? sz.stock
                          const origStock = original[product.id]?.[variant.id]?.[sz.size] ?? sz.stock
                          return (
                            <div key={sz.size} className="flex flex-col items-center gap-1">
                              <span className="text-xs text-muted-foreground font-medium">{sz.size}</span>
                              <input
                                type="number"
                                min={0}
                                value={curStock}
                                onChange={e => handleChange(product.id, variant.id, sz.size, e.target.value)}
                                className={`w-16 text-center text-sm font-bold px-1 py-1.5 border focus:outline-none focus:ring-1 transition-colors ${stockInputClass(origStock, curStock)}`}
                              />
                              {stockBadge(curStock)}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Legacy products note */}
      {legacyCount > 0 && (
        <p className="mt-6 text-sm text-muted-foreground text-center">
          {legacyCount} product{legacyCount !== 1 ? 's' : ''} without variant data are hidden.
          Edit them in <a href="/admin/products" className="text-[#53c87a] underline">Products</a> to add variants.
        </p>
      )}
    </div>
  )
}
