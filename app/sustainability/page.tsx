import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { Leaf, Recycle, Globe, Heart } from 'lucide-react'

export const metadata = {
  title: 'Sustainability | SHAPESHIFTERS',
  description: 'Our commitment to sustainable fashion and environmental responsibility.',
}

export default function SustainabilityPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-4">
                Our Commitment
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                Sustainable by Design
              </h1>
              <p className="text-lg text-primary-foreground/70 leading-relaxed">
                We believe that great style shouldn&apos;t cost the earth. That&apos;s why 
                sustainability is at the core of everything we do.
              </p>
            </div>
          </div>
        </section>

        {/* Pillars Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Leaf,
                  title: 'Organic Materials',
                  description: 'We prioritize organic cotton, recycled polyester, and other sustainable fabrics in our collections.',
                },
                {
                  icon: Recycle,
                  title: 'Zero Waste Goals',
                  description: 'Our production process minimizes waste, and we continuously work toward zero-waste manufacturing.',
                },
                {
                  icon: Globe,
                  title: 'Carbon Neutral',
                  description: 'We offset our carbon footprint through verified environmental programs and green initiatives.',
                },
                {
                  icon: Heart,
                  title: 'Ethical Production',
                  description: 'All our manufacturing partners meet strict ethical standards for fair wages and safe working conditions.',
                },
              ].map((pillar) => (
                <div key={pillar.title} className="text-center p-6">
                  <div className="mx-auto w-16 h-16 bg-accent/20 flex items-center justify-center mb-6">
                    <pillar.icon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-bold text-lg mb-3">{pillar.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Goals Section */}
        <section className="py-20 bg-secondary">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Our 2030 Goals</h2>
              <div className="grid sm:grid-cols-3 gap-8">
                <div>
                  <p className="text-4xl font-bold text-accent mb-2">100%</p>
                  <p className="text-sm text-muted-foreground">Sustainable Materials</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-accent mb-2">50%</p>
                  <p className="text-sm text-muted-foreground">Carbon Reduction</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-accent mb-2">0</p>
                  <p className="text-sm text-muted-foreground">Landfill Waste</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Certifications & Partners</h2>
              <p className="text-muted-foreground">
                We work with leading sustainability organizations to verify our practices.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-muted-foreground">
              <div className="border border-border px-8 py-4 text-center">
                <p className="font-bold">GOTS Certified</p>
                <p className="text-sm">Organic Textiles</p>
              </div>
              <div className="border border-border px-8 py-4 text-center">
                <p className="font-bold">Fair Trade</p>
                <p className="text-sm">Certified Partner</p>
              </div>
              <div className="border border-border px-8 py-4 text-center">
                <p className="font-bold">B Corp</p>
                <p className="text-sm">Pending Certification</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
