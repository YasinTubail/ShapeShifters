"use client"

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Search, Menu, X } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useState } from 'react'



const navLinks = [
  { href: '/collections', label: 'Collections' },
  { href: '/collections/1st', label: '1ST' },
  { href: '/shop', label: 'Shop All' },
  { href: '/shop?category=Hoodies', label: 'Hoodies' },
  { href: '/about', label: 'About' },
]

export function Header() {
  const { totalItems, setIsCartOpen } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium tracking-wide text-primary-foreground/80 hover:text-accent transition-colors uppercase"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3">
            <Image 
              src="/images/logo.png" 
              alt="SHAPESHIFTERS Logo" 
              width={44} 
              height={44} 
              className="h-9 w-9 sm:h-11 sm:w-11 object-contain"
            />
            <h1 className="text-base sm:text-xl tracking-[0.25em] font-bold uppercase" style={{ fontFamily: 'var(--font-display)' }}>
              SHAPESHIFTERS
            </h1>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:text-accent transition-colors" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>
            <button 
              className="p-2 hover:text-accent transition-colors relative"
              onClick={() => setIsCartOpen(true)}
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-primary-foreground/20">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium tracking-wide text-primary-foreground/80 hover:text-accent transition-colors uppercase"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
