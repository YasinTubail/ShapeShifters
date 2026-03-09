"use client"

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle, Package, ArrowRight, Loader2, Mail, Truck,
  ShieldCheck, Banknote, Phone, MapPin,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { getCheckoutSession } from '@/app/actions/stripe'
import { getCODOrder } from '@/app/actions/cod'
import { formatPrice } from '@/lib/currency'

// ── Stripe order shape ────────────────────────────────────────────────────────
interface OrderDetails {
  id: string
  customerEmail: string | null
  customerName: string | null
  amountTotal: number
  currency: string
  paymentStatus: string
  lineItems: Array<{
    name: string
    quantity: number | null
    amount: number
  }>
  shippingAddress: {
    line1?: string | null
    line2?: string | null
    city?: string | null
    state?: string | null
    postal_code?: string | null
    country?: string | null
  } | null
  createdAt: string
}

// ── COD order shape (from Prisma, serialized through server action boundary) ──
interface CodOrder {
  id: string
  customerName: string
  customerEmail: string | null
  customerPhone: string
  shippingLine1: string
  shippingLine2: string | null
  shippingCity: string
  shippingPostal: string | null
  shippingCountry: string
  totalAmount: number
  couponCode: string | null
  notes: string | null
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    size: string
    color: string | null
  }>
}

// ── What's Next steps ─────────────────────────────────────────────────────────
const STRIPE_STEPS = [
  { icon: Mail,    title: 'E-posta Onayı',    description: 'Sipariş detaylarını içeren e-posta gönderildi' },
  { icon: Package, title: 'Hazırlanıyor',      description: 'Siparişiniz 1-2 iş günü içinde hazırlanacak' },
  { icon: Truck,   title: 'Kargoya Verilecek', description: 'Tahmini teslimat: 3-5 iş günü' },
]

const COD_STEPS = [
  { icon: Package,  title: 'Hazırlanıyor',      description: 'Siparişiniz 1-2 iş günü içinde hazırlanacak' },
  { icon: Truck,    title: 'Kargoya Verilecek', description: 'Tahmini teslimat: 3-5 iş günü' },
  { icon: Banknote, title: 'Kapıda Ödeme',      description: 'Kurye geldiğinde nakit ödeme yapılacak' },
]

// ── Main component ────────────────────────────────────────────────────────────
function SuccessContent() {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const orderId   = searchParams.get('order_id')

  const [status,       setStatus]       = useState<'loading' | 'success'>('loading')
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [codOrder,     setCodOrder]     = useState<CodOrder | null>(null)
  const hasCleared = useRef(false)

  useEffect(() => {
    async function fetchOrderDetails() {
      if (hasCleared.current) return
      hasCleared.current = true
      clearCart()

      if (orderId) {
        // COD path
        try {
          const order = await getCODOrder(orderId)
          if (order) setCodOrder(order as unknown as CodOrder)
        } catch (e) {
          console.error('Error fetching COD order:', e)
        }
        setStatus('success')
      } else if (sessionId) {
        // Stripe path
        try {
          const details = await getCheckoutSession(sessionId)
          setOrderDetails(details as unknown as OrderDetails)
        } catch (e) {
          console.error('Error fetching order details:', e)
        }
        setStatus('success')
      } else {
        setStatus('success')
      }
    }

    fetchOrderDetails()
  }, [sessionId, orderId, clearCart])

  // Display order ID
  const displayOrderId = codOrder
    ? `SS-${codOrder.id.slice(-8).toUpperCase()}`
    : orderDetails?.id
    ? `SS-${orderDetails.id.slice(-8).toUpperCase()}`
    : `SS-${Date.now().toString(36).toUpperCase()}`

  const isCOD   = Boolean(codOrder)
  const steps   = isCOD ? COD_STEPS : STRIPE_STEPS

  if (status === 'loading') {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-accent mx-auto mb-4" />
            <p className="text-muted-foreground">Siparişiniz onaylanıyor...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">

          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="mx-auto w-20 h-20 bg-accent/20 flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-accent" />
            </div>
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              SİPARİŞİNİZ ONAYLANDI
            </h1>
            <p className="text-lg text-muted-foreground">
              Alışverişiniz için teşekkür ederiz!
            </p>
          </div>

          {/* Order Confirmation Card */}
          <div className="bg-card border border-border mb-8">

            {/* Header bar */}
            <div className="bg-primary text-primary-foreground p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm opacity-80 mb-1">Sipariş Numarası</p>
                  <p className="text-xl font-bold tracking-wider">{displayOrderId}</p>
                </div>
                {isCOD ? (
                  <div className="flex items-center gap-2 text-sm bg-amber-500/20 border border-amber-400/30 px-3 py-2">
                    <Banknote className="h-4 w-4 text-amber-300" />
                    <span className="font-medium">Kapıda Ödeme</span>
                  </div>
                ) : orderDetails?.customerEmail ? (
                  <div className="text-sm sm:text-right">
                    <p className="opacity-80 mb-1">Onay e-postası gönderildi:</p>
                    <p className="font-medium">{orderDetails.customerEmail}</p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* ── COD: Items ─────────────────────────────────────────────── */}
            {isCOD && codOrder && codOrder.items.length > 0 && (
              <div className="p-6 border-b border-border">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-accent" />
                  Sipariş Detayları
                </h3>
                <div className="space-y-4">
                  {codOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Beden: {item.size}
                          {item.color && ` · ${item.color}`}
                          {' · '}Adet: {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-accent">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold">Toplam</span>
                    <span className="text-xl font-bold text-accent">
                      {formatPrice(codOrder.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Stripe: Items ───────────────────────────────────────────── */}
            {!isCOD && orderDetails?.lineItems && orderDetails.lineItems.length > 0 && (
              <div className="p-6 border-b border-border">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-accent" />
                  Sipariş Detayları
                </h3>
                <div className="space-y-4">
                  {orderDetails.lineItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Adet: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-accent">{formatPrice(item.amount)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Kargo</span>
                    <span className="text-sm text-accent font-medium">Ücretsiz</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold">Toplam</span>
                    <span className="text-xl font-bold text-accent">
                      {formatPrice(orderDetails.amountTotal)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── COD: Shipping address ───────────────────────────────────── */}
            {isCOD && codOrder && (
              <div className="p-6 border-b border-border">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  Teslimat Bilgileri
                </h3>
                <div className="text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">{codOrder.customerName}</p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {codOrder.customerPhone}
                  </p>
                  <p>{codOrder.shippingLine1}</p>
                  {codOrder.shippingLine2 && <p>{codOrder.shippingLine2}</p>}
                  <p>
                    {[codOrder.shippingPostal, codOrder.shippingCity, codOrder.shippingCountry]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
                {codOrder.notes && (
                  <p className="mt-3 text-sm text-muted-foreground italic">
                    Not: {codOrder.notes}
                  </p>
                )}
              </div>
            )}

            {/* ── Stripe: Shipping address ────────────────────────────────── */}
            {!isCOD && orderDetails?.shippingAddress && (
              <div className="p-6 border-b border-border">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-accent" />
                  Teslimat Adresi
                </h3>
                <div className="text-muted-foreground">
                  <p>{orderDetails.customerName}</p>
                  <p>{orderDetails.shippingAddress.line1}</p>
                  {orderDetails.shippingAddress.line2 && <p>{orderDetails.shippingAddress.line2}</p>}
                  <p>
                    {orderDetails.shippingAddress.postal_code} {orderDetails.shippingAddress.city}
                  </p>
                  <p>{orderDetails.shippingAddress.country}</p>
                </div>
              </div>
            )}

            {/* ── Footer notice ───────────────────────────────────────────── */}
            <div className="p-6 bg-secondary/50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/20 flex items-center justify-center flex-shrink-0">
                  {isCOD
                    ? <Banknote className="h-5 w-5 text-accent" />
                    : <Mail    className="h-5 w-5 text-accent" />
                  }
                </div>
                {isCOD ? (
                  <div>
                    <h4 className="font-bold mb-1">Kapıda Nakit Ödeme</h4>
                    <p className="text-sm text-muted-foreground">
                      Siparişiniz hazırlandıktan sonra kargoya verilecek. Kurye kapınıza geldiğinde{' '}
                      <strong>{formatPrice(codOrder?.totalAmount ?? 0)}</strong> nakit ödeme yapacaksınız.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-bold mb-1">E-posta Faturanız Gönderildi</h4>
                    <p className="text-sm text-muted-foreground">
                      Sipariş onayı ve faturanız{' '}
                      <strong>{orderDetails?.customerEmail || 'e-posta adresinize'}</strong>{' '}
                      gönderildi. Spam klasörünüzü de kontrol etmeyi unutmayın.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="bg-card border border-border p-6 text-center">
                  <div className="w-12 h-12 bg-accent/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h4 className="font-bold mb-2">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              )
            })}
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-12">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <span>Güvenli Alışveriş</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-accent" />
              <span>Hızlı Teslimat</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
              <Link href="/shop">
                Alışverişe Devam Et
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/">Ana Sayfaya Dön</Link>
            </Button>
          </div>

        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}

function LoadingFallback() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Sipariş bilgileri yükleniyor...</p>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  )
}
