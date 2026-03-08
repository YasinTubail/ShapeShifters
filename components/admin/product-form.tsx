"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react'
import { createProduct, updateProduct } from '@/app/actions/admin'
import type { ProductWithActive } from '@/lib/server-products'
import type { Collection } from '@/lib/server-products'
import type { ProductVariant, VariantSize } from '@/lib/cart-context'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['Hoodies', 'Tees', 'Bottoms', 'Accessories']
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', 'One Size']

/** Best-guess hex values for the built-in color names */
const COLOR_HEX_MAP: Record<string, string> = {
  Black: '#1a1a1a',
  White: '#f5f5f5',
  Forest: '#1b4332',
  Emerald: '#10b981',
  Beige: '#f5f0e8',
  Navy: '#1e3a5f',
  Grey: '#9ca3af',
  Brown: '#92400e',
  Cream: '#fffdd0',
  Olive: '#708238',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function guessHex(color: string): string {
  return COLOR_HEX_MAP[color] ?? '#000000'
}

function makeVariantId() {
  return `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

/** Auto-generate a SKU from product ID, color, and size */
function autoSku(productId: string, color: string, size: string): string {
  const pid = productId.replace(/-/g, '').toUpperCase().slice(0, 8)
  const col = color.replace(/\s+/g, '').slice(0, 3).toUpperCase()
  return `${pid}-${col}-${size}`
}

/**
 * Initialise the variants array when editing an existing product:
 * - if the product already has variants, use them directly
 * - otherwise, migrate the legacy flat fields into a single starter variant
 */
function initVariants(product?: ProductWithActive): ProductVariant[] {
  if (product?.variants?.length) return product.variants
  if (!product) return []
  return [
    {
      id: makeVariantId(),
      color: product.color || 'Default',
      colorHex: guessHex(product.color || ''),
      images: [product.image, ...(product.images ?? [])].filter(Boolean) as string[],
      sizes: (product.size ?? []).map((s) => ({
        size: s,
        stock: 0,
        sku: autoSku(product.id, product.color || '', s),
      })),
    },
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ProductFormProps {
  product?: ProductWithActive
  collections: Collection[]
  mode: 'create' | 'edit'
}

export function ProductForm({ product, collections, mode }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Basic product fields
  const [form, setForm] = useState({
    id: product?.id ?? '',
    name: product?.name ?? '',
    price: product?.price?.toString() ?? '',
    category: product?.category ?? 'Hoodies',
    description: product?.description ?? '',
    material: product?.material ?? '',
    collection: product?.collection ?? '',
  })

  // Variant state
  const [variants, setVariants] = useState<ProductVariant[]>(() => initVariants(product))
  // Which variant panels are expanded (by index)
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set([0]))

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // ── Variant helpers ──────────────────────────────────────────

  function addVariant() {
    const idx = variants.length
    setVariants((prev) => [
      ...prev,
      { id: makeVariantId(), color: '', colorHex: '#000000', images: [], sizes: [] },
    ])
    setExpanded((prev) => new Set([...prev, idx]))
  }

  function removeVariant(vIdx: number) {
    setVariants((prev) => prev.filter((_, i) => i !== vIdx))
    setExpanded((prev) => {
      const next = new Set<number>()
      prev.forEach((i) => {
        if (i < vIdx) next.add(i)
        if (i > vIdx) next.add(i - 1)
      })
      return next
    })
  }

  function updateVariantField(vIdx: number, field: keyof ProductVariant, value: unknown) {
    setVariants((prev) => prev.map((v, i) => (i === vIdx ? { ...v, [field]: value } : v)))
  }

  function toggleExpanded(vIdx: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(vIdx) ? next.delete(vIdx) : next.add(vIdx)
      return next
    })
  }

  // Image helpers
  function addImage(vIdx: number) {
    setVariants((prev) =>
      prev.map((v, i) => (i === vIdx ? { ...v, images: [...v.images, ''] } : v))
    )
  }

  function updateImage(vIdx: number, iIdx: number, value: string) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === vIdx ? { ...v, images: v.images.map((img, j) => (j === iIdx ? value : img)) } : v
      )
    )
  }

  function removeImage(vIdx: number, iIdx: number) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === vIdx ? { ...v, images: v.images.filter((_, j) => j !== iIdx) } : v
      )
    )
  }

  // Size helpers
  function toggleSize(vIdx: number, size: string) {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== vIdx) return v
        const existingIdx = v.sizes.findIndex((s) => s.size === size)
        if (existingIdx >= 0) {
          return { ...v, sizes: v.sizes.filter((s) => s.size !== size) }
        }
        const newSize: VariantSize = {
          size,
          stock: 0,
          sku: autoSku(form.id, v.color, size),
        }
        // Insert in canonical order
        const insertIdx = v.sizes.findIndex(
          (s) => ALL_SIZES.indexOf(s.size) > ALL_SIZES.indexOf(size)
        )
        const newSizes = [...v.sizes]
        insertIdx === -1 ? newSizes.push(newSize) : newSizes.splice(insertIdx, 0, newSize)
        return { ...v, sizes: newSizes }
      })
    )
  }

  function updateSizeField(
    vIdx: number,
    sIdx: number,
    field: 'stock' | 'sku',
    value: string | number
  ) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === vIdx
          ? { ...v, sizes: v.sizes.map((s, j) => (j === sIdx ? { ...s, [field]: value } : s)) }
          : v
      )
    )
  }

  // ── Submit ───────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (variants.length === 0) {
      setError('Please add at least one color variant.')
      setLoading(false)
      return
    }

    for (const v of variants) {
      if (!v.color.trim()) {
        setError('All variants must have a color name.')
        setLoading(false)
        return
      }
      if (v.images.filter(Boolean).length === 0) {
        setError(`Variant "${v.color || '(unnamed)'}" must have at least one image path.`)
        setLoading(false)
        return
      }
      if (v.sizes.length === 0) {
        setError(`Variant "${v.color}" must have at least one size selected.`)
        setLoading(false)
        return
      }
    }

    // Derive legacy flat fields from first variant for full backwards-compat
    const firstVariant = variants[0]
    const allSizes = [...new Set(variants.flatMap((v) => v.sizes.map((s) => s.size)))]
    const colorLabel =
      variants.length === 1
        ? firstVariant.color
        : variants.map((v) => v.color).join(' / ')

    const data: ProductWithActive = {
      id: form.id.toLowerCase().replace(/\s+/g, '-'),
      name: form.name,
      price: parseFloat(form.price),
      image: firstVariant.images.find(Boolean) ?? '',
      category: form.category,
      color: colorLabel,
      size: allSizes,
      description: form.description,
      material: form.material || undefined,
      collection: form.collection || undefined,
      active: product?.active ?? true,
      variants,
    }

    const result =
      mode === 'create'
        ? await createProduct(data)
        : await updateProduct(product!.id, data)

    if (result.success) {
      router.push('/admin/products')
    } else {
      setError(result.error ?? 'Something went wrong.')
      setLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {/* ═══ SECTION 1: Basic product info ═══════════════════════════ */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">
          Product Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Product ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product ID <span className="text-red-500">*</span>
            </label>
            <input
              value={form.id}
              onChange={(e) => set('id', e.target.value)}
              placeholder="e.g. 1st-008"
              required
              disabled={mode === 'edit'}
              className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e] disabled:bg-gray-50 disabled:text-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">Cannot be changed after creation.</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Pyramid Stamp Hoodie"
              required
              className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e]"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₺) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="e.g. 3290"
              required
              min="0"
              step="1"
              className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e] bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Collection */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Collection</label>
            <select
              value={form.collection}
              onChange={(e) => set('collection', e.target.value)}
              className="w-full sm:w-1/2 px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e] bg-white"
            >
              <option value="">None</option>
              {collections.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Material */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
          <input
            value={form.material}
            onChange={(e) => set('material', e.target.value)}
            placeholder="e.g. 100% Premium Cotton Fleece"
            className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e]"
          />
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Describe the product..."
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e] resize-none"
          />
        </div>
      </div>

      {/* ═══ SECTION 2: Color variants ═══════════════════════════════ */}
      <div>
        <div className="flex items-start justify-between pb-2 border-b border-gray-100 mb-4">
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Color Variants &amp; Stock
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Each color has its own images and per-size inventory.
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#01301e] text-[#01301e] hover:bg-[#01301e] hover:text-white transition-colors flex-shrink-0 ml-4"
          >
            <Plus className="h-3.5 w-3.5" /> Add Color
          </button>
        </div>

        {/* Empty state */}
        {variants.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 p-10 text-center">
            <p className="text-sm text-gray-400">No color variants yet.</p>
            <button
              type="button"
              onClick={addVariant}
              className="mt-3 text-sm text-[#01301e] hover:underline font-medium"
            >
              + Add your first color variant
            </button>
          </div>
        )}

        {/* Variant cards */}
        <div className="space-y-3">
          {variants.map((v, vIdx) => {
            const isExpanded = expanded.has(vIdx)
            const totalStock = v.sizes.reduce((sum, s) => sum + Math.max(0, s.stock), 0)

            return (
              <div key={v.id} className="border border-gray-200">

                {/* ── Header row ── */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/80">
                  {/* Color swatch preview */}
                  <div
                    className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: v.colorHex }}
                  />

                  {/* Color name inline edit */}
                  <input
                    type="text"
                    value={v.color}
                    onChange={(e) => updateVariantField(vIdx, 'color', e.target.value)}
                    placeholder="Color name (e.g. Black)"
                    className="flex-1 text-sm font-medium bg-transparent border border-transparent focus:border-gray-200 focus:bg-white px-2 py-1 -mx-2 focus:outline-none min-w-0"
                  />

                  {/* Summary badges */}
                  {v.sizes.length > 0 && (
                    <span className="text-xs text-gray-400 hidden sm:block whitespace-nowrap flex-shrink-0">
                      {v.sizes.length} size{v.sizes.length !== 1 ? 's' : ''} · {totalStock} in stock
                    </span>
                  )}
                  {v.images.filter(Boolean).length > 0 && (
                    <span className="text-xs text-gray-400 hidden sm:block whitespace-nowrap flex-shrink-0">
                      {v.images.filter(Boolean).length} img{v.images.filter(Boolean).length !== 1 ? 's' : ''}
                    </span>
                  )}

                  {/* Hex color picker */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <label className="text-xs text-gray-400 hidden sm:block">Swatch</label>
                    <input
                      type="color"
                      value={v.colorHex}
                      onChange={(e) => updateVariantField(vIdx, 'colorHex', e.target.value)}
                      className="w-7 h-7 p-0.5 border border-gray-200 cursor-pointer rounded"
                      title="Pick swatch color"
                    />
                  </div>

                  {/* Expand / collapse */}
                  <button
                    type="button"
                    onClick={() => toggleExpanded(vIdx)}
                    className="text-gray-400 hover:text-gray-700 flex-shrink-0"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeVariant(vIdx)}
                    className="text-gray-300 hover:text-red-500 flex-shrink-0 transition-colors"
                    title="Remove this color variant"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* ── Expanded body ── */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 pb-5 pt-4 space-y-6">

                    {/* — Images — */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Images
                        </label>
                        <p className="text-xs text-gray-400">First path = primary hero image</p>
                      </div>

                      <div className="space-y-2">
                        {v.images.map((img, iIdx) => (
                          <div key={iIdx} className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-12 flex-shrink-0 font-medium">
                              {iIdx === 0 ? '★ Main' : `Alt ${iIdx}`}
                            </span>
                            <input
                              type="text"
                              value={img}
                              onChange={(e) => updateImage(vIdx, iIdx, e.target.value)}
                              placeholder="/images/collections/your-image.jpg"
                              className="flex-1 px-2.5 py-1.5 text-xs border border-gray-200 focus:outline-none focus:border-[#01301e] font-mono min-w-0"
                            />
                            {/* Tiny preview thumbnail */}
                            {img && (
                              <div className="w-8 h-10 flex-shrink-0 bg-gray-100 overflow-hidden border border-gray-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={img}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.style.opacity = '0.15' }}
                                />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(vIdx, iIdx)}
                              className="text-gray-300 hover:text-red-400 flex-shrink-0"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addImage(vIdx)}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-[#01301e] hover:underline"
                      >
                        <Plus className="h-3 w-3" /> Add image path
                      </button>
                    </div>

                    {/* — Sizes & Stock — */}
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex-shrink-0 mt-1">
                          Sizes &amp; Stock
                        </label>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {ALL_SIZES.map((s) => {
                            const active = v.sizes.some((vs) => vs.size === s)
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => toggleSize(vIdx, s)}
                                className={`px-2 py-0.5 text-xs border transition-colors ${
                                  active
                                    ? 'bg-[#01301e] text-white border-[#01301e]'
                                    : 'border-gray-200 text-gray-500 hover:border-[#01301e] hover:text-[#01301e]'
                                }`}
                              >
                                {s}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {v.sizes.length > 0 ? (
                        <div className="border border-gray-100 overflow-hidden">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-3 py-2 font-semibold text-gray-500 w-16">Size</th>
                                <th className="text-left px-3 py-2 font-semibold text-gray-500 w-32">Stock (units)</th>
                                <th className="text-left px-3 py-2 font-semibold text-gray-500">SKU</th>
                                <th className="w-8" />
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {v.sizes.map((vs, sIdx) => (
                                <tr key={vs.size} className={vs.stock === 0 ? 'bg-red-50/40' : 'bg-white'}>
                                  <td className="px-3 py-2">
                                    <span className={`font-semibold ${vs.stock === 0 ? 'text-red-400' : 'text-gray-700'}`}>
                                      {vs.size}
                                    </span>
                                    {vs.stock === 0 && (
                                      <span className="ml-1 text-[10px] text-red-400 font-normal">OOS</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      min={0}
                                      value={vs.stock}
                                      onChange={(e) =>
                                        updateSizeField(vIdx, sIdx, 'stock', parseInt(e.target.value) || 0)
                                      }
                                      className="w-20 px-2 py-1 border border-gray-200 focus:outline-none focus:border-[#01301e] text-center"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={vs.sku}
                                      onChange={(e) => updateSizeField(vIdx, sIdx, 'sku', e.target.value)}
                                      placeholder={autoSku(form.id || 'PROD', v.color, vs.size)}
                                      className="w-full px-2 py-1 border border-gray-200 focus:outline-none focus:border-[#01301e] font-mono uppercase"
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-right">
                                    <button
                                      type="button"
                                      onClick={() => toggleSize(vIdx, vs.size)}
                                      className="text-gray-300 hover:text-red-400 transition-colors"
                                      title="Remove this size"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 py-3 px-1">
                          Click the size chips above to add sizes to this variant.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══ Submit actions ════════════════════════════════════════════ */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#01301e] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#0b6e4f] transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="px-6 py-2.5 text-sm font-medium border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
