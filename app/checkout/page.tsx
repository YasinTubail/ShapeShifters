"use client"

import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import Checkout from '@/components/checkout'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ShoppingBag, Loader2, Minus, Plus, Trash2, Package, Truck, Shield, Tag, CheckCircle2, XCircle } from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { validateCoupon } from '@/app/actions/coupons'

export default function CheckoutPage() {
  const { items, totalPrice, isLoaded, removeItem, updateQuantity, totalItems } = useCart()

  // Coupon state
  const [couponInput, setCouponInput] = useState('')
  const [couponStatus, setCouponStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle')
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discountAmount: number
    type: string
    value: number
  } | null>(null)

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return
    setCouponStatus('loading')
    setCouponError('')
    const result = await validateCoupon(couponInput, totalPrice)
    if (result.valid && result.discountAmount !== undefined) {
      setAppliedCoupon({
        code: result.code!,
        discountAmount: result.discountAmount,
        type: result.type!,
        value: result.value!,
      })
      setCouponStatus('valid')
    } else {
      setCouponStatus('invalid')
      setCouponError(result.error ?? 'Invalid coupon code.')
      setAppliedCoupon(null)
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null)
    setCouponStatus('idle')
    setCouponInput('')
    setCouponError('')
  }

  // Prepare cart items for Stripe
  const cartItems = items.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    selectedSize: item.selectedSize
  }))

  // Calculate shipping (free over 1500 TL)
  const shippingCost = totalPrice >= 1500 ? 0 : 49
  const discountAmount = appliedCoupon?.discountAmount ?? 0
  const grandTotal = totalPrice + shippingCost - discountAmount

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <Link 
            href="/shop"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors mb-8 font-medium"
          >
            <ChevronLeft className="h-4 w-4" />
            Continue Shopping
          </Link>

          {!isLoaded ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-accent mb-4" />
              <p className="text-muted-foreground">Loading your bag...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag className="h-20 w-20 text-muted-foreground/30 mb-6" />
              <h1 className="text-2xl font-bold mb-2">Your bag is empty</h1>
              <p className="text-muted-foreground mb-8">Add some items to get started</p>
              <Link 
                href="/shop"
                className="bg-accent text-accent-foreground px-8 py-3 font-bold uppercase tracking-wide hover:bg-accent/90 transition-colors"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <>
              {/* Page Header */}
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                  CHECKOUT
                </h1>
                <span className="text-sm text-muted-foreground">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="grid lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-12">
                {/* Cart Items - Left Side */}
                <div className="lg:col-span-3 order-2 lg:order-1">
                  <div className="bg-card border border-border">
                    {/* Cart Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-secondary">
                      <h2 className="text-lg font-bold uppercase tracking-wide">Your Bag</h2>
                      <span className="text-sm text-muted-foreground">{totalItems} items</span>
                    </div>

                    {/* Cart Items List */}
                    <div className="divide-y divide-border">
                      {items.map((item) => (
                        <div 
                          key={`${item.id}-${item.selectedSize}`} 
                          className="p-4 sm:p-6 flex gap-4 sm:gap-6 hover:bg-secondary/30 transition-colors"
                        >
                          {/* Product Image */}
                          <Link 
                            href={`/product/${item.id}`}
                            className="relative w-24 h-32 sm:w-32 sm:h-40 bg-secondary flex-shrink-0 overflow-hidden group"
                          >
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>

                          {/* Product Details */}
                          <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex justify-between gap-2">
                              <div className="min-w-0">
                                <Link 
                                  href={`/product/${item.id}`}
                                  className="text-sm sm:text-base font-bold hover:text-accent transition-colors line-clamp-2"
                                >
                                  {item.name}
                                </Link>
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm text-muted-foreground">
                                    Size: <span className="text-foreground font-medium">{item.selectedSize}</span>
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Color: <span className="text-foreground font-medium">{item.color}</span>
                                  </p>
                                </div>
                              </div>
                              
                              {/* Unit Price */}
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm text-muted-foreground">Each</p>
                                <p className="text-sm font-medium">{formatPrice(item.price)}</p>
                              </div>
                            </div>

                            {/* Quantity Controls & Total */}
                            <div className="mt-auto pt-4 flex items-center justify-between gap-4">
                              {/* Quantity Selector */}
                              <div className="flex items-center">
                                <span className="text-sm text-muted-foreground mr-3 hidden sm:inline">Qty:</span>
                                <div className="flex items-center border border-border bg-background">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                                    className="p-2 sm:p-3 hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Decrease quantity"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </button>
                                  <span className="px-4 sm:px-6 text-sm sm:text-base font-bold min-w-[3rem] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                                    className="p-2 sm:p-3 hover:bg-secondary transition-colors"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Item Total & Delete */}
                              <div className="flex items-center gap-4">
                                <p className="text-base sm:text-lg font-bold text-accent">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                                <button
                                  onClick={() => removeItem(item.id, item.selectedSize)}
                                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cart Footer - Continue Shopping */}
                    <div className="p-4 sm:p-6 border-t border-border bg-secondary/50">
                      <Link 
                        href="/shop"
                        className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Add more items
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Order Summary & Payment - Right Side */}
                <div className="lg:col-span-2 order-1 lg:order-2">
                  <div className="lg:sticky lg:top-24 space-y-6">
                    {/* Order Summary Card */}
                    <div className="bg-secondary p-6">
                      <h2 className="text-lg font-bold uppercase tracking-wide mb-6">Order Summary</h2>
                      
                      {/* Summary Lines */}
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                          <span className="font-medium">{formatPrice(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping</span>
                          {shippingCost === 0 ? (
                            <span className="text-accent font-medium">FREE</span>
                          ) : (
                            <span className="font-medium">{formatPrice(shippingCost)}</span>
                          )}
                        </div>
                        {shippingCost > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Free shipping on orders over {formatPrice(1500)}
                          </p>
                        )}
                      </div>

                        {/* Discount */}
                        {appliedCoupon && (
                          <div className="flex justify-between text-sm text-accent font-medium">
                            <span className="flex items-center gap-1">
                              <Tag className="h-3.5 w-3.5" />
                              {appliedCoupon.code}
                            </span>
                            <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
                          </div>
                        )}

                      {/* Coupon input */}
                      <div className="mb-6 border-t border-border pt-4">
                        {appliedCoupon ? (
                          <div className="flex items-center justify-between bg-accent/10 border border-accent/30 px-3 py-2">
                            <span className="flex items-center gap-2 text-sm font-medium text-accent">
                              <CheckCircle2 className="h-4 w-4" />
                              {appliedCoupon.code} applied
                            </span>
                            <button
                              onClick={handleRemoveCoupon}
                              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs font-medium uppercase tracking-wide mb-2 text-muted-foreground">
                              Discount Code
                            </p>
                            <div className="flex gap-2">
                              <input
                                value={couponInput}
                                onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponStatus('idle'); setCouponError('') }}
                                onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                                placeholder="Enter code"
                                className="flex-1 border border-border bg-background px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-1 focus:ring-accent"
                              />
                              <Button
                                onClick={handleApplyCoupon}
                                disabled={couponStatus === 'loading' || !couponInput.trim()}
                                size="sm"
                                variant="outline"
                                className="font-bold text-xs uppercase tracking-wide"
                              >
                                {couponStatus === 'loading'
                                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  : 'Apply'}
                              </Button>
                            </div>
                            {couponStatus === 'invalid' && (
                              <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                                <XCircle className="h-3.5 w-3.5" /> {couponError}
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {/* Total */}
                      <div className="flex justify-between items-center font-bold text-lg pt-4 border-t border-border">
                        <span>Total</span>
                        <span className="text-accent text-xl">{formatPrice(grandTotal)}</span>
                      </div>
                    </div>

                    {/* Stripe Checkout */}
                    <div className="bg-card border border-border p-3 sm:p-6">
                      <h2 className="text-lg font-bold uppercase tracking-wide mb-4 sm:mb-6">Payment</h2>
                      <Checkout cartItems={cartItems} couponCode={appliedCoupon?.code} />
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="flex flex-col items-center gap-2 p-4 bg-secondary/50">
                        <Shield className="h-6 w-6 text-accent" />
                        <span className="text-xs text-muted-foreground">Secure Payment</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-4 bg-secondary/50">
                        <Truck className="h-6 w-6 text-accent" />
                        <span className="text-xs text-muted-foreground">Fast Delivery</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-4 bg-secondary/50">
                        <Package className="h-6 w-6 text-accent" />
                        <span className="text-xs text-muted-foreground">Easy Returns</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
