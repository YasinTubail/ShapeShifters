import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { getActiveCollections } from '@/lib/server-products'

export const dynamic = 'force-dynamic'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: 'Collections | SHAPESHIFTERS',
  description: 'Explore our curated collections of premium streetwear',
}

export default function CollectionsPage() {
  const collections = getActiveCollections()
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              COLLECTIONS
            </h1>
            <p className="text-lg sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Each collection tells a unique story. Discover pieces that resonate with your style.
            </p>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug}`}
                  className="group relative aspect-[4/5] overflow-hidden bg-muted"
                >
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    {collection.featured && (
                      <span className="text-xs uppercase tracking-widest text-accent mb-2">
                        Featured Collection
                      </span>
                    )}
                    <h2 
                      className="text-3xl sm:text-4xl font-bold text-white mb-2"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {collection.name}
                    </h2>
                    <p className="text-white/80 text-sm sm:text-base max-w-md mb-4">
                      {collection.description}
                    </p>
                    <span className="inline-flex items-center text-accent font-medium group-hover:gap-2 transition-all">
                      Explore Collection
                      <svg 
                        className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
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
