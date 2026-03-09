"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import Checkout from '@/components/checkout'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft, ShoppingBag, Loader2, Minus, Plus, Trash2,
  Package, Truck, Shield, Tag, CheckCircle2, XCircle,
  CreditCard, Banknote, AlertCircle,
} from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { validateCoupon } from '@/app/actions/coupons'
import { placeCODOrder } from '@/app/actions/cod'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, isLoaded, removeItem, updateQuantity, totalItems, clearCart } = useCart()

  // ── Payment method ─────────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'COD'>('STRIPE')

  // ── Coupon state ───────────────────────────────────────────────────────────
  const [couponInput, setCouponInput]   = useState('')
  const [couponStatus, setCouponStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle')
  const [couponError, setCouponError]   = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discountAmount: number
    type: string
    value: number
  } | null>(null)

  // ── COD form state ─────────────────────────────────────────────────────────
  const [codName,       setCodName]       = useState('')
  const [codPhone,      setCodPhone]      = useState('')
  const [codLine1,      setCodLine1]      = useState('')
  const [codLine2,      setCodLine2]      = useState('')
  const [codCity,       setCodCity]       = useState('')
  const [codPostal,     setCodPostal]     = useState('')
  const [codNotes,      setCodNotes]      = useState('')
  const [codSubmitting, setCodSubmitting] = useState(false)
  const [codError,      setCodError]      = useState('')

  // ── Coupon handlers ────────────────────────────────────────────────────────
  async function handleApplyCoupon() {
    if (!couponInput.trim()) return
    setCouponStatus('loading')
    setCouponError('')
    const result = await validateCoupon(couponInput, totalPrice)
    if (result.valid && result.discountAmount !== undefined) {
      setAppliedCoupon({
        code:           result.code!,
        discountAmount: result.discountAmount,
        type:           result.type!,
        value:          result.value!,
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

  // ── COD submit ─────────────────────────────────────────────────────────────
  async function handlePlaceCODOrder() {
    setCodError('')
    if (!codName.trim())  { setCodError('Ad Soyad gereklidir.');      return }
    if (!codPhone.trim()) { setCodError('Telefon numarası gereklidir.'); return }
    if (!codLine1.trim()) { setCodError('Adres gereklidir.');          return }
    if (!codCity.trim())  { setCodError('Şehir gereklidir.');          return }

    setCodSubmitting(true)
    const result = await placeCODOrder({
      customerName:   codName.trim(),
      customerPhone:  codPhone.trim(),
      shippingLine1:  codLine1.trim(),
      shippingLine2:  codLine2.trim()   || undefined,
      shippingCity:   codCity.trim(),
      shippingPostal: codPostal.trim()  || undefined,
      notes:          codNotes.trim()   || undefined,
      cartItems: items.map(item => ({
        id:           item.id,
        name:         item.name,
        price:        item.price,
        quantity:     item.quantity,
        selectedSize: item.selectedSize,
        color:        item.color,
      })),
      couponCode: appliedCoupon?.code,
    })
    setCodSubmitting(false)

    if ('error' in result && result.error) {
      setCodError(result.error)
    } else if ('orderId' in result) {
      clearCart()
      router.push(`/checkout/success?order_id=${result.orderId}`)
    }
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const cartItems = items.map(item => ({
    id:           item.id,
    name:         item.name,
    price:        item.price,
    quantity:     item.quantity,
    selectedSize: item.selectedSize,
  }))
  const shippingCost   = totalPrice >= 1500 ? 0 : 49
  const discountAmount = appliedCoupon?.discountAmount ?? 0
  const grandTotal     = totalPrice + shippingCost - discountAmount

  // ── Style helpers ──────────────────────────────────────────────────────────
  const inputClass = 'w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent'
  const labelClass = 'text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1 block'

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

                {/* ── Cart Items (left) ──────────────────────────────────────── */}
                <div className="lg:col-span-3 order-2 lg:order-1">
                  <div className="bg-card border border-border">
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-secondary">
                      <h2 className="text-lg font-bold uppercase tracking-wide">Your Bag</h2>
                      <span className="text-sm text-muted-foreground">{totalItems} items</span>
                    </div>

                    <div className="divide-y divide-border">
                      {items.map((item) => (
                        <div
                          key={`${item.id}-${item.selectedSize}`}
                          className="p-4 sm:p-6 flex gap-4 sm:gap-6 hover:bg-secondary/30 transition-colors"
                        >
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
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm text-muted-foreground">Each</p>
                                <p className="text-sm font-medium">{formatPrice(item.price)}</p>
                              </div>
                            </div>

                            <div className="mt-auto pt-4 flex items-center justify-between gap-4">
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

                {/* ── Order Summary + Payment (right) ───────────────────────── */}
                <div className="lg:col-span-2 order-1 lg:order-2">
                  <div className="lg:sticky lg:top-24 space-y-6">

                    {/* Order Summary */}
                    <div className="bg-secondary p-6">
                      <h2 className="text-lg font-bold uppercase tracking-wide mb-6">Order Summary</h2>

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

                      {appliedCoupon && (
                        <div className="flex justify-between text-sm text-accent font-medium mb-3">
                          <span className="flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5" />
                            {appliedCoupon.code}
                          </span>
                          <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
                        </div>
                      )}

                      {/* Coupon */}
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

                      {/* Grand Total */}
                      <div className="flex justify-between items-center font-bold text-lg pt-4 border-t border-border">
                        <span>Total</span>
                        <span className="text-accent text-xl">{formatPrice(grandTotal)}</span>
                      </div>
                    </div>

                    {/* ── Payment Method Toggle ──────────────────────────────── */}
                    <div className="bg-card border border-border p-4 sm:p-6">
                      <h2 className="text-base font-bold uppercase tracking-wide mb-4">Payment Method</h2>
                      <div className="grid grid-cols-2 gap-3">
                        {([
                          { value: 'STRIPE' as const, label: 'Credit / Debit Card', Icon: CreditCard, desc: 'Secure online payment' },
                          { value: 'COD'    as const, label: 'Pay on Delivery',     Icon: Banknote,    desc: 'Cash at your door'    },
                        ] as const).map(({ value, label, Icon, desc }) => {
                          const selected = paymentMethod === value
                          return (
                            <button
                              key={value}
                              onClick={() => setPaymentMethod(value)}
                              className={`flex flex-col items-center gap-2 p-4 border-2 transition-all text-center ${
                                selected
                                  ? 'border-accent bg-accent/5 text-accent'
                                  : 'border-border bg-background text-muted-foreground hover:border-accent/40'
                              }`}
                            >
                              <Icon className="h-6 w-6" />
                              <span className="text-xs font-bold uppercase tracking-wide leading-tight">{label}</span>
                              <span className="text-[10px] opacity-70">{desc}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* ── Payment Panel ─────────────────────────────────────── */}
                    {paymentMethod === 'STRIPE' ? (
                      <div className="bg-card border border-border p-3 sm:p-6">
                        <h2 className="text-lg font-bold uppercase tracking-wide mb-4 sm:mb-6">Payment</h2>
                        <Checkout cartItems={cartItems} couponCode={appliedCoupon?.code} />
                      </div>
                    ) : (
                      <div className="bg-card border border-border p-4 sm:p-6">
                        <h2 className="text-lg font-bold uppercase tracking-wide mb-6">Delivery Details</h2>

                        <div className="space-y-4">
                          {/* Name */}
                          <div>
                            <label className={labelClass}>
                              Ad Soyad <span className="text-destructive">*</span>
                            </label>
                            <input
                              value={codName}
                              onChange={e => setCodName(e.target.value)}
                              placeholder="Ad Soyad"
                              className={inputClass}
                            />
                          </div>

                          {/* Phone */}
                          <div>
                            <label className={labelClass}>
                              Telefon <span className="text-destructive">*</span>
                            </label>
                            <input
                              type="tel"
                              value={codPhone}
                              onChange={e => setCodPhone(e.target.value)}
                              placeholder="0(5XX) XXX XX XX"
                              className={inputClass}
                            />
                          </div>

                          {/* Address Line 1 */}
                          <div>
                            <label className={labelClass}>
                              Adres <span className="text-destructive">*</span>
                            </label>
                            <input
                              value={codLine1}
                              onChange={e => setCodLine1(e.target.value)}
                              placeholder="Mahalle, cadde, sokak, no"
                              className={inputClass}
                            />
                          </div>

                          {/* Address Line 2 */}
                          <div>
                            <label className={labelClass}>Adres 2 (opsiyonel)</label>
                            <input
                              value={codLine2}
                              onChange={e => setCodLine2(e.target.value)}
                              placeholder="Daire, kat, blok"
                              className={inputClass}
                            />
                          </div>

                          {/* City + Postal */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={labelClass}>
                                Şehir <span className="text-destructive">*</span>
                              </label>
                              <input
                                value={codCity}
                                onChange={e => setCodCity(e.target.value)}
                                placeholder="İstanbul"
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Posta Kodu</label>
                              <input
                                value={codPostal}
                                onChange={e => setCodPostal(e.target.value)}
                                placeholder="34000"
                                className={inputClass}
                              />
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                            <label className={labelClass}>Sipariş Notu (opsiyonel)</label>
                            <textarea
                              value={codNotes}
                              onChange={e => setCodNotes(e.target.value)}
                              placeholder="Kapı kodu, ek bilgi..."
                              rows={2}
                              className={`${inputClass} resize-none`}
                            />
                          </div>

                          {/* Error */}
                          {codError && (
                            <div className="flex items-center gap-2 text-destructive text-sm">
                              <AlertCircle className="h-4 w-4 flex-shrink-0" />
                              {codError}
                            </div>
                          )}

                          {/* Submit */}
                          <Button
                            onClick={handlePlaceCODOrder}
                            disabled={codSubmitting}
                            size="lg"
                            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold uppercase tracking-wide"
                          >
                            {codSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Sipariş Oluşturuluyor...
                              </>
                            ) : (
                              <>
                                <Banknote className="h-4 w-4 mr-2" />
                                Siparişi Onayla — {formatPrice(grandTotal)}
                              </>
                            )}
                          </Button>

                          <p className="text-xs text-muted-foreground text-center">
                            Kapıda nakit ödeme · Kargo tesliminde ödenir
                          </p>
                        </div>
                      </div>
                    )}

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
