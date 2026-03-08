import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Careers | SHAPESHIFTERS',
  description: 'Join the SHAPESHIFTERS team. View open positions and become part of our mission.',
}

const openPositions = [
  {
    title: 'Senior Fashion Designer',
    department: 'Design',
    location: 'Los Angeles, CA',
    type: 'Full-time',
  },
  {
    title: 'E-commerce Manager',
    department: 'Digital',
    location: 'Remote',
    type: 'Full-time',
  },
  {
    title: 'Social Media Coordinator',
    department: 'Marketing',
    location: 'Los Angeles, CA',
    type: 'Full-time',
  },
  {
    title: 'Production Coordinator',
    department: 'Operations',
    location: 'Los Angeles, CA',
    type: 'Full-time',
  },
]

export default function CareersPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-4">
                Join Us
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                Shape the Future of Fashion
              </h1>
              <p className="text-lg text-primary-foreground/70 leading-relaxed">
                We&apos;re looking for passionate individuals who want to challenge conventions 
                and create something meaningful. Join our team of shifters.
              </p>
            </div>
          </div>
        </section>

        {/* Why Join Us */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center">Why SHAPESHIFTERS?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Creative Freedom',
                  description: 'Express your ideas in an environment that celebrates bold thinking and innovation.',
                },
                {
                  title: 'Growth Opportunities',
                  description: 'Learn, develop, and advance your career with mentorship and professional development.',
                },
                {
                  title: 'Inclusive Culture',
                  description: 'Be part of a diverse team where every voice is heard and valued.',
                },
              ].map((benefit) => (
                <div key={benefit.title} className="bg-secondary p-8">
                  <h3 className="font-bold text-lg mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="py-20 bg-secondary">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
            <p className="text-muted-foreground mb-12">
              Find your next opportunity with us.
            </p>
            <div className="space-y-4">
              {openPositions.map((position) => (
                <div 
                  key={position.title} 
                  className="bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-lg transition-shadow"
                >
                  <div>
                    <h3 className="font-bold text-lg mb-2">{position.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>{position.department}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {position.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {position.type}
                      </span>
                    </div>
                  </div>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Don't See Your Role */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Don&apos;t see your role?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              We&apos;re always looking for talented individuals. Send us your resume and 
              tell us how you can contribute to the SHAPESHIFTERS mission.
            </p>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
