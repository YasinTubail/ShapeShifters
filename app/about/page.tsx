import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'About | SHAPESHIFTERS',
  description: 'Discover the story behind SHAPESHIFTERS - bold streetwear for those who dare to transform.',
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-4">
                Our Story
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Born to Transform
              </h1>
              <p className="text-lg text-primary-foreground/70 leading-relaxed">
                SHAPESHIFTERS was founded on a simple belief: fashion should empower you 
                to become whoever you want to be. We create clothing for those who refuse 
                to be defined by convention.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">The Mission</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  In a world of fast fashion and fleeting trends, we chose a different path. 
                  Every piece in our collection is designed to last - both in quality and style. 
                  We believe in creating garments that become part of your identity, not just 
                  another item in your closet.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Our signature forest green represents growth, transformation, and the 
                  endless possibilities that await when you dare to shift your perspective.
                </p>
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/shop">Explore the Collection</Link>
                </Button>
              </div>
              <div className="relative aspect-square bg-secondary">
                <Image
                  src="/images/story.jpg"
                  alt="SHAPESHIFTERS brand story"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 lg:py-32 bg-secondary">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every decision we make is guided by these core principles.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Quality First',
                  description: 'We source the finest materials and partner with ethical manufacturers to ensure every piece meets our exacting standards.',
                },
                {
                  title: 'Sustainable Practice',
                  description: 'From organic cotton to responsible packaging, we are committed to minimizing our environmental footprint.',
                },
                {
                  title: 'Bold Expression',
                  description: 'We design for those who want to make a statement. Our clothing is for the fearless, the dreamers, the shapeshifters.',
                },
              ].map((value) => (
                <div key={value.title} className="bg-card p-8">
                  <h3 className="font-bold text-lg mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-32 bg-primary text-primary-foreground">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Join the Movement</h2>
            <p className="text-primary-foreground/70 max-w-2xl mx-auto mb-8">
              Ready to transform your wardrobe? Explore our latest collection and 
              discover pieces that speak to who you are - and who you want to become.
            </p>
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/shop">Shop Now</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
