"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/currency'
import type { Product, ProductVariant } from '@/lib/cart-context'

export function ProductDetail({ product }: { product: Product }) {
  // Active color variant (null when product uses legacy flat fields)
  const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(
    product.variants?.[0] ?? null
  )
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  // Reset image + selected size whenever the active color changes
  useEffect(() => {
    setActiveImageIdx(0)
    setSelectedSize('')
  }, [activeVariant?.id])

  // ── Derived display values ───────────────────────────────────
  const images: string[] =
    (activeVariant?.images ?? []).filter(Boolean).length > 0
      ? activeVariant!.images.filter(Boolean)
      : product.image
      ? [product.image]
      : []

  const currentImage = images[activeImageIdx] ?? images[0] ?? '/placeholder.jpg'

  // Sizes with stock info: use variant sizes if available, else legacy flat list
  const sizeList =
    activeVariant?.sizes ??
    product.size.map((s) => ({ size: s, stock: -1, sku: '' }))

  const hasVariants = (product.variants?.length ?? 0) > 0
  const hasOosSize = sizeList.some((s) => s.stock === 0)

  // ── Handlers ────────────────────────────────────────────────
  function handleAddToCart() {
    if (!selectedSize) {
      alert('Please select a size')
      return
    }
    // Pass the product with the active variant's resolved color + image
    // so the cart display shows the correct swatch / thumbnail
    const productForCart: Product = {
      ...product,
      image: images[0] ?? product.image,
      color: activeVariant?.color ?? product.color,
    }
    addItem(productForCart, selectedSize, activeVariant?.color)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

      {/* ── LEFT: image gallery ─────────────────────────────── */}
      <div className="relative">
        {/* Decorative offset shadow */}
        <div className="absolute inset-0 bg-accent/10 -translate-x-3 -translate-y-3 hidden lg:block pointer-events-none" />

        {/* Main image */}
        <div className="relative aspect-[3/4] bg-secondary z-10 overflow-hidden">
          <Image
            key={currentImage}
            src={currentImage}
            alt={product.name}
            fill
            className="object-cover transition-opacity duration-300"
            priority
          />
        </div>

        {/* Thumbnail strip — only when a variant has multiple images */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 z-10 relative overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIdx(i)}
                className={`relative w-16 h-20 flex-shrink-0 overflow-hidden transition-all ${
                  i === activeImageIdx
                    ? 'ring-2 ring-accent ring-offset-1'
                    : 'ring-1 ring-border hover:ring-accent/50'
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── RIGHT: product info + actions ───────────────────── */}
      <div className="lg:py-8">

        {/* Category */}
        <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-3">
          {product.category}
        </p>

        {/* Name */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          {product.name}
        </h1>

        {/* Price */}
        <p className="text-2xl font-bold text-accent mb-6">
          {formatPrice(product.price)}
        </p>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed mb-8">
          {product.description}
        </p>

        {/* ── Color swatches (variant products only) ── */}
        {hasVariants ? (
          <div className="mb-6">
            <p className="text-sm font-medium mb-3">
              Color:{' '}
              <span className="text-muted-foreground font-normal">
                {activeVariant?.color ?? product.color}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {product.variants!.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveVariant(v)}
                  title={v.color}
                  aria-label={`Select color: ${v.color}`}
                  className={`w-9 h-9 rounded-full border-[3px] transition-all duration-150 ${
                    activeVariant?.id === v.id
                      ? 'border-accent scale-110 shadow-md'
                      : 'border-transparent hover:border-accent/50 hover:scale-105'
                  }`}
                  style={{ backgroundColor: v.colorHex }}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Legacy flat color label */
          <div className="mb-6">
            <p className="text-sm font-medium">
              Color:{' '}
              <span className="text-muted-foreground">{product.color}</span>
            </p>
          </div>
        )}

        {/* ── Size selector ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Select Size</p>
            <Link
              href="/size-guide"
              className="text-sm text-accent hover:underline transition-colors"
            >
              Size Guide
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizeList.map(({ size, stock }) => {
              const outOfStock = stock === 0 // stock -1 = unknown (legacy) → treat as available
              return (
                <button
                  key={size}
                  onClick={() => !outOfStock && setSelectedSize(size)}
                  disabled={outOfStock}
                  aria-disabled={outOfStock}
                  className={`relative min-w-[48px] px-4 py-3 border text-sm font-medium transition-all ${
                    outOfStock
                      ? 'border-border text-muted-foreground/40 cursor-not-allowed'
                      : selectedSize === size
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-border hover:border-accent hover:text-accent'
                  }`}
                >
                  {/* Diagonal strikethrough for OOS */}
                  {outOfStock && (
                    <span
                      className="absolute inset-0 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="block w-full border-t border-muted-foreground/30 rotate-[-25deg]" />
                    </span>
                  )}
                  {size}
                </button>
              )
            })}
          </div>
          {hasOosSize && (
            <p className="text-xs text-muted-foreground mt-2">
              Crossed-out sizes are currently out of stock.
            </p>
          )}
        </div>

        {/* ── Add to bag ── */}
        <Button
          onClick={handleAddToCart}
          size="lg"
          className={`w-full mb-8 transition-all ${
            added
              ? 'bg-accent text-accent-foreground'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {added ? (
            <span className="flex items-center gap-2">
              <Check className="h-5 w-5" /> Added to Bag
            </span>
          ) : (
            'Add to Bag'
          )}
        </Button>

        {/* ── Product details ── */}
        <div className="border-t border-border pt-8">
          <h3 className="text-sm font-bold uppercase tracking-wide mb-4">
            Product Details
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {product.material && <li>Material: {product.material}</li>}
            <li>Color: {activeVariant?.color ?? product.color}</li>
            <li>Free shipping on orders over ₺3.000</li>
            <li>30-day hassle-free returns</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
