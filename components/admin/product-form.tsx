"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct } from '@/app/actions/admin'
import type { ProductWithActive } from '@/lib/server-products'
import type { Collection } from '@/lib/server-products'

const CATEGORIES = ['Hoodies', 'Tees', 'Bottoms', 'Accessories']
const COLORS = ['Black', 'White', 'Forest', 'Emerald', 'Beige', 'Navy', 'Grey']
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', 'One Size']

interface ProductFormProps {
  product?: ProductWithActive
  collections: Collection[]
  mode: 'create' | 'edit'
}

export function ProductForm({ product, collections, mode }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sizes, setSizes] = useState<string[]>(product?.size ?? ['S', 'M', 'L', 'XL'])

  const [form, setForm] = useState({
    id: product?.id ?? '',
    name: product?.name ?? '',
    price: product?.price?.toString() ?? '',
    image: product?.image ?? '',
    category: product?.category ?? 'Hoodies',
    color: product?.color ?? 'Black',
    description: product?.description ?? '',
    material: product?.material ?? '',
    collection: product?.collection ?? '',
  })

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleSize(size: string) {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (sizes.length === 0) {
      setError('Please select at least one size.')
      setLoading(false)
      return
    }

    const data: ProductWithActive = {
      id: form.id.toLowerCase().replace(/\s+/g, '-'),
      name: form.name,
      price: parseFloat(form.price),
      image: form.image,
      category: form.category,
      color: form.color,
      size: sizes,
      description: form.description,
      material: form.material || undefined,
      collection: form.collection || undefined,
      active: product?.active ?? true,
    }

    const result = mode === 'create'
      ? await createProduct(data)
      : await updateProduct(product!.id, data)

    if (result.success) {
      router.push('/admin/products')
    } else {
      setError(result.error ?? 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Product ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product ID <span className="text-red-500">*</span>
          </label>
          <input
            value={form.id}
            onChange={(e) => set('id', e.target.value)}
            placeholder="e.g. 1st-008 or ess-008"
            required
            disabled={mode === 'edit'}
            className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e] disabled:bg-gray-50 disabled:text-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1">Unique identifier. Cannot be changed after creation.</p>
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
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <select
            value={form.color}
            onChange={(e) => set('color', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e] bg-white"
          >
            {COLORS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Collection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Collection</label>
          <select
            value={form.collection}
            onChange={(e) => set('collection', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e] bg-white"
          >
            <option value="">None</option>
            {collections.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Image path */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image Path <span className="text-red-500">*</span>
        </label>
        <input
          value={form.image}
          onChange={(e) => set('image', e.target.value)}
          placeholder="/images/collections/1st/your-image.jpg"
          required
          className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e]"
        />
        <p className="text-xs text-gray-400 mt-1">
          Upload your image to <code>public/images/</code> first, then enter the path here.
        </p>
      </div>

      {/* Material */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
        <input
          value={form.material}
          onChange={(e) => set('material', e.target.value)}
          placeholder="e.g. 100% Premium Cotton Fleece"
          className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e]"
        />
      </div>

      {/* Description */}
      <div>
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

      {/* Sizes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Available Sizes <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`px-3 py-1.5 text-sm border font-medium transition-colors ${
                sizes.includes(size)
                  ? 'border-[#01301e] bg-[#01301e] text-white'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
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
