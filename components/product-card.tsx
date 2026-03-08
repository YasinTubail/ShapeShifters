"use client"

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/cart-context'
import { formatPrice } from '@/lib/currency'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="group">
      <div className="relative aspect-[3/4] bg-secondary overflow-hidden mb-4">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
          <span className="text-primary-foreground text-sm font-bold tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity bg-primary px-4 py-2">
            Quick View
          </span>
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground">{product.color}</p>
        <p className="text-sm font-bold text-accent">{formatPrice(product.price)}</p>
      </div>
    </Link>
  )
}
