import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { FeaturedProducts } from '@/components/featured-products'
import { CategorySection } from '@/components/category-section'
import { StorySection } from '@/components/story-section'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeaturedProducts />
        <CategorySection />
        <StorySection />
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
