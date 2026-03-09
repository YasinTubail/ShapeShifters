"use client"

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import type { Product } from '@/lib/cart-context'

export function ProductActions({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState('')
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size')
      return
    }
    addItem(product, selectedSize)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">Select Size</p>
          <button className="text-sm text-accent hover:underline">Size Guide</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.size.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`min-w-[48px] px-4 py-3 border text-sm font-medium transition-all ${
                selectedSize === size
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-border hover:border-accent hover:text-accent'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleAddToCart}
        size="lg"
        className={`w-full transition-all ${
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
    </>
  )
}
