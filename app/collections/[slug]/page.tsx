"use client"

import { use } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { ProductCard } from '@/components/product-card'
import { collections, getProductsByCollection, getCollectionBySlug } from '@/lib/products'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

interface CollectionPageProps {
  params: Promise<{ slug: string }>
}

export default function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = use(params)
  const collection = getCollectionBySlug(slug)
  
  if (!collection) {
    notFound()
  }

  const collectionProducts = getProductsByCollection(slug)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
          <Image
            src={collection.image}
            alt={collection.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 w-full">
              <Link 
                href="/collections" 
                className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                All Collections
              </Link>
              {collection.featured && (
                <span className="block text-xs uppercase tracking-widest text-accent mb-2">
                  Featured Collection
                </span>
              )}
              <h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {collection.name}
              </h1>
              <p className="text-lg sm:text-xl text-white/80 max-w-2xl">
                {collection.description}
              </p>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <p className="text-muted-foreground">
                {collectionProducts.length} {collectionProducts.length === 1 ? 'product' : 'products'}
              </p>
            </div>

            {collectionProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {collectionProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  No products in this collection yet.
                </p>
                <Link 
                  href="/shop"
                  className="inline-block mt-4 text-accent hover:underline"
                >
                  Browse all products
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Other Collections */}
        <section className="py-12 sm:py-16 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 
              className="text-2xl sm:text-3xl font-bold mb-8"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              OTHER COLLECTIONS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections
                .filter((c) => c.slug !== slug)
                .map((otherCollection) => (
                  <Link
                    key={otherCollection.id}
                    href={`/collections/${otherCollection.slug}`}
                    className="group relative aspect-[3/4] overflow-hidden bg-muted"
                  >
                    <Image
                      src={otherCollection.image}
                      alt={otherCollection.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 
                        className="text-xl font-bold text-white"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {otherCollection.name}
                      </h3>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
