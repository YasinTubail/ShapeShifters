import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { ProductCard } from '@/components/product-card'
import { ProductActions } from '@/components/product-actions'
import { formatPrice } from '@/lib/currency'
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/10 -translate-x-3 -translate-y-3 hidden lg:block" />
              <div className="relative aspect-[3/4] bg-secondary">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <div className="lg:py-8">
              <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-3">
                {product.category}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-accent mb-6">
                {formatPrice(product.price)}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                {product.description}
              </p>
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">
                  Color: <span className="text-muted-foreground">{product.color}</span>
                </p>
              </div>

              <ProductActions product={product} />

              <div className="border-t border-border pt-8 mt-8">
                <h3 className="text-sm font-bold uppercase tracking-wide mb-4">Product Details</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {product.material && <li>Material: {product.material}</li>}
                  <li>Color: {product.color}</li>
                  <li>Free shipping on orders over ₺3.000</li>
                  <li>30-day hassle-free returns</li>
                </ul>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <section className="mt-20 border-t border-border pt-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">You May Also Like</h2>
                <Link href="/shop" className="text-sm text-muted-foreground hover:text-accent transition-colors uppercase tracking-wide">
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
