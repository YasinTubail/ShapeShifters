"use client"

import Link from 'next/link'
import Image from 'next/image'

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-primary overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-muted/30 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="text-primary-foreground">
            <p className="text-accent text-sm font-bold tracking-[0.3em] uppercase mb-4">
              New Collection 2026
            </p>
            <h2 
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-none mb-6 text-balance"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              SHIFT YOUR
              <br />
              <span className="text-accent">REALITY</span>
            </h2>
            <p className="text-lg text-primary-foreground/70 max-w-md mb-10 leading-relaxed">
              Bold designs for those who refuse to blend in. Transform your wardrobe with pieces that make a statement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/shop"
                className="bg-accent text-accent-foreground px-10 py-4 text-sm font-bold tracking-[0.1em] uppercase hover:bg-accent/90 transition-colors text-center"
              >
                Shop Now
              </Link>
              <Link
                href="/shop?category=New"
                className="border-2 border-primary-foreground text-primary-foreground px-10 py-4 text-sm font-bold tracking-[0.1em] uppercase hover:bg-primary-foreground hover:text-primary transition-colors text-center"
              >
                New Arrivals
              </Link>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-[3/4] w-full max-w-lg mx-auto">
              <div className="absolute inset-0 bg-accent/20 translate-x-4 translate-y-4" />
              <Image
                src="/images/hero.jpg"
                alt="SHAPESHIFTERS streetwear collection"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-foreground/50 animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
