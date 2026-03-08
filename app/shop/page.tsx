import { Suspense } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { ProductFilters } from '@/components/product-filters'
import { ProductGrid } from '@/components/product-grid'
import { getActiveProducts, getActiveCollections } from '@/lib/server-products'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Shop | SHAPESHIFTERS',
  description: 'Discover our full collection of bold streetwear pieces',
}

export default function ShopPage() {
  const products = getActiveProducts()
  const collections = getActiveCollections()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="bg-primary text-primary-foreground py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-2">
              The Collection
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Shop All</h1>
            <p className="text-primary-foreground/70 max-w-lg">
              Bold pieces designed for transformation. Find your next statement piece.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading...</div>}>
            <ProductFilters collections={collections} />
            <ProductGrid products={products} collections={collections} />
          </Suspense>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
