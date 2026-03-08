import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { FeaturedProducts } from '@/components/featured-products'
import { CategorySection } from '@/components/category-section'
import { StorySection } from '@/components/story-section'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { getActiveProducts } from '@/lib/server-products'

export const dynamic = 'force-dynamic'

export default function Home() {
  const products = getActiveProducts()

  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeaturedProducts products={products} />
        <CategorySection />
        <StorySection />
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
