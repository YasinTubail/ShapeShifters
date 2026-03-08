"use client"

import { use, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Check } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { Button } from '@/components/ui/button'
import { products } from '@/lib/products'
import { useCart } from '@/lib/cart-context'
import { ProductCard } from '@/components/product-card'
import { formatPrice } from '@/lib/currency'

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const product = products.find((p) => p.id === id)
  const [selectedSize, setSelectedSize] = useState('')
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Link href="/shop" className="text-accent hover:underline">
              Return to shop
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

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
      <Header />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <Link 
            href="/shop"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors mb-8 font-medium"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Image */}
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

            {/* Details */}
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

              {/* Color */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Color: <span className="text-muted-foreground">{product.color}</span></p>
              </div>

              {/* Size selection */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Select Size</p>
                  <button className="text-sm text-accent hover:underline">
                    Size Guide
                  </button>
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

              {/* Add to cart */}
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

              {/* Details */}
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

          {/* Related products */}
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
