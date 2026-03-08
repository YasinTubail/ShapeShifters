import Link from 'next/link'
import Image from 'next/image'

export function StorySection() {
  return (
    <section className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 -translate-x-4 -translate-y-4" />
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/images/story.jpg"
                alt="SHAPESHIFTERS brand story"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-4">
              Our Story
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6 text-balance">
              More Than Just Clothing
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
              <p>
                SHAPESHIFTERS was born from a simple belief: your style should evolve as you do. We create pieces for those who refuse to be defined by a single look or moment.
              </p>
              <p>
                Every drop is designed for transformation - versatile pieces that adapt to your mood, your day, your evolution. From the streets to the studio, we move with you.
              </p>
              <p>
                Made with premium materials and built to last. Because real style is sustainable style.
              </p>
            </div>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-bold tracking-wide uppercase text-foreground hover:text-accent transition-colors group"
            >
              Learn More
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
