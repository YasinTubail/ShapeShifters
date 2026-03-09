"use client"

import Link from 'next/link'
import Image from 'next/image'

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-primary overflow-hidden">

      {/* ── Diagonal scan-line texture ─────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              -48deg,
              transparent,
              transparent 38px,
              rgba(83,200,122,0.025) 38px,
              rgba(83,200,122,0.025) 39px
            )
          `,
        }}
        aria-hidden="true"
      />

      {/* ── Giant faded logo watermark ─────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <Image
          src="/images/logo.png"
          alt=""
          width={800}
          height={800}
          className="opacity-[0.038] w-[360px] sm:w-[540px] lg:w-[740px] object-contain"
          aria-hidden="true"
        />
      </div>

      {/* ── Animated gradient orbs ─────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Top-left — primary orb */}
        <div
          className="absolute -top-36 -left-36 w-[26rem] h-[26rem] bg-accent/20 rounded-full blur-3xl"
          style={{ animation: 'float-orb 14s ease-in-out infinite' }}
        />
        {/* Bottom-right — large secondary orb */}
        <div
          className="absolute -bottom-24 -right-24 w-[32rem] h-[32rem] bg-accent/12 rounded-full blur-3xl"
          style={{ animation: 'float-orb-reverse 17s ease-in-out infinite' }}
        />
        {/* Centre — deep emerald orb */}
        <div
          className="absolute top-1/3 left-[45%] w-72 h-72 bg-[#0b6e4f]/35 rounded-full blur-2xl"
          style={{ animation: 'float-orb-slow 20s ease-in-out infinite 2s' }}
        />
        {/* Upper-right spark */}
        <div
          className="absolute top-12 right-[28%] w-36 h-36 bg-accent/18 rounded-full blur-xl"
          style={{ animation: 'float-orb-reverse 11s ease-in-out infinite 1s' }}
        />
        {/* Mid-left accent */}
        <div
          className="absolute bottom-1/3 -left-10 w-48 h-48 bg-[#0b6e4f]/25 rounded-full blur-2xl"
          style={{ animation: 'float-orb 16s ease-in-out infinite 4s' }}
        />
      </div>

      {/* ── Vertical line accents ──────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-accent/20 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary-foreground/10 to-transparent" />
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── Text panel (glassmorphism) ─────────────────────────────── */}
          <div
            className="text-primary-foreground"
            style={{ animation: 'hero-fade-up 0.85s ease-out forwards' }}
          >
            {/* Glass card */}
            <div className="relative backdrop-blur-[2px] bg-white/[0.04] border border-white/10 p-8 lg:p-10">
              {/* Corner accents */}
              <span className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-accent/50 pointer-events-none" />
              <span className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-accent/50 pointer-events-none" />

              <p className="text-accent text-sm font-bold tracking-[0.3em] uppercase mb-5">
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
          </div>

          {/* ── Hero image with pulse ring ─────────────────────────────── */}
          <div
            className="relative hidden lg:block"
            style={{ animation: 'hero-fade-up-delayed 1.2s ease-out forwards' }}
          >
            <div className="relative aspect-[3/4] w-full max-w-lg mx-auto">
              {/* Animated pulse ring */}
              <div
                className="absolute -inset-2 z-0"
                style={{ animation: 'pulse-ring 3.5s ease-out infinite' }}
              />
              {/* Decorative offset shadow */}
              <div className="absolute inset-0 bg-accent/20 translate-x-5 translate-y-5 z-0" />
              <Image
                src="/images/hero.jpg"
                alt="SHAPESHIFTERS streetwear collection"
                fill
                className="object-cover relative z-10"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ──────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-foreground/50 animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
