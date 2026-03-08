import Link from 'next/link'
import { ProductCard } from './product-card'
import type { Product } from '@/lib/cart-context'

export function FeaturedProducts({ products }: { products: Product[] }) {
  const featured = products.slice(0, 4)

  return (
    <section className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-2">
              Fresh Drops
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Featured Pieces
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-sm font-medium tracking-wide text-muted-foreground hover:text-accent transition-colors uppercase group flex items-center gap-2"
          >
            View All
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
