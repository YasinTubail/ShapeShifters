"use client"

import { useSearchParams } from 'next/navigation'
import { products, collections } from '@/lib/products'
import { ProductCard } from './product-card'
import { useMemo } from 'react'

export function ProductGrid() {
  const searchParams = useSearchParams()
  
  const category = searchParams.get('category') || 'All'
  const color = searchParams.get('color') || 'All'
  const size = searchParams.get('size') || ''
  const sort = searchParams.get('sort') || 'newest'
  const collectionFilter = searchParams.get('collection') || 'All'

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Filter by collection
    if (collectionFilter !== 'All') {
      const collection = collections.find(c => c.name === collectionFilter)
      if (collection) {
        filtered = filtered.filter((p) => p.collection === collection.slug)
      }
    }

    if (category !== 'All') {
      filtered = filtered.filter((p) => p.category === category)
    }

    if (color !== 'All') {
      filtered = filtered.filter((p) => p.color === color)
    }

    if (size) {
      filtered = filtered.filter((p) => p.size.includes(size))
    }

    switch (sort) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      default:
        // newest - keep original order (assuming it's by date)
        break
    }

    return filtered
  }, [category, color, size, sort, collectionFilter])

  if (filteredProducts.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground mb-4">No products match your filters.</p>
        <p className="text-sm text-muted-foreground">Try adjusting your selection.</p>
      </div>
    )
  }

  return (
    <div className="py-8">
      <p className="text-sm text-muted-foreground mb-8">
        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
