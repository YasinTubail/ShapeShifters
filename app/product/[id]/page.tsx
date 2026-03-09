import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { ProductCard } from '@/components/product-card'
import { ProductDetail } from '@/components/product-detail'
import { getProductById, getActiveProducts } from '@/lib/server-products'

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = getProductById(id)

  if (!product) notFound()

  const allProducts = getActiveProducts()
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors mb-8 font-medium"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to shop
          </Link>

          {/* Main product grid: client component handles gallery + color swatches + add-to-cart */}
          <ProductDetail product={product} />

          {relatedProducts.length > 0 && (
            <section className="mt-20 border-t border-border pt-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">You May Also Like</h2>
                <Link
                  href="/shop"
                  className="text-sm text-muted-foreground hover:text-accent transition-colors uppercase tracking-wide"
                >
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
