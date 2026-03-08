"use client"

import { X, Minus, Plus, ShoppingBag, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/currency'

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalPrice, isLoaded } = useCart()

  if (!isCartOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-primary/50 z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-primary text-primary-foreground">
          <h2 className="text-lg font-bold tracking-wide uppercase">Your Bag</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:text-accent transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isLoaded ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-10 w-10 animate-spin text-accent" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-foreground font-bold mb-2">Your bag is empty</p>
              <p className="text-sm text-muted-foreground mb-6">Add some heat to get started</p>
              <Button 
                onClick={() => setIsCartOpen(false)}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                asChild
              >
                <Link href="/shop">Shop Now</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4">
                  <div className="relative w-24 h-32 bg-secondary flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-sm font-bold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Size: {item.selectedSize}</p>
                        <p className="text-sm text-muted-foreground">Color: {item.color}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.selectedSize)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove item"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                          className="p-2 hover:bg-secondary transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-4 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          className="p-2 hover:bg-secondary transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-accent">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-6 bg-secondary">
            <div className="flex justify-between mb-4">
              <span className="font-bold">Subtotal</span>
              <span className="font-bold text-accent">{formatPrice(totalPrice)}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Shipping calculated at checkout
            </p>
            <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
              <Link href="/checkout">Checkout</Link>
            </Button>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
