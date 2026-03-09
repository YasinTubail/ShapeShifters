"use client"

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, ArrowRight, Loader2, Mail, Truck, ShieldCheck } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { getCheckoutSession } from '@/app/actions/stripe'
import { formatPrice } from '@/lib/currency'

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

function SuccessContent() {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const hasCleared = useRef(false)

  useEffect(() => {
    async function fetchOrderDetails() {
      if (sessionId && !hasCleared.current) {
        hasCleared.current = true
        clearCart()
        
        try {
          const details = await getCheckoutSession(sessionId)
          setOrderDetails(details as unknown as OrderDetails)
          setStatus('success')
        } catch (error) {
          console.error('Error fetching order details:', error)
          setStatus('success') // Still show success even if we can't fetch details
        }
      } else if (!sessionId) {
        setStatus('success')
        if (!hasCleared.current) {
          hasCleared.current = true
          clearCart()
        }
      }
    }

    fetchOrderDetails()
  }, [sessionId, clearCart])

  // Generate a display order ID
  const displayOrderId = orderDetails?.id 
    ? `SS-${orderDetails.id.slice(-8).toUpperCase()}`
    : `SS-${Date.now().toString(36).toUpperCase()}`

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
            {/* Order ID Header */}
            <div className="bg-primary text-primary-foreground p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm opacity-80 mb-1">Sipariş Numarası</p>
                  <p className="text-xl font-bold tracking-wider">{displayOrderId}</p>
                </div>
                {orderDetails?.customerEmail && (
                  <div className="text-sm sm:text-right">
                    <p className="opacity-80 mb-1">Onay e-postası gönderildi:</p>
                    <p className="font-medium">{orderDetails.customerEmail}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            {orderDetails?.lineItems && orderDetails.lineItems.length > 0 && (
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
                
                {/* Total */}
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

            {/* Shipping Address */}
            {orderDetails?.shippingAddress && (
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

            {/* Email Receipt Notice */}
            <div className="p-6 bg-secondary/50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">E-posta Faturanız Gönderildi</h4>
                  <p className="text-sm text-muted-foreground">
                    Sipariş onayı ve faturanız{' '}
                    <strong>{orderDetails?.customerEmail || 'e-posta adresinize'}</strong>{' '}
                    gönderildi. Spam klasörünüzü de kontrol etmeyi unutmayın.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {[
              {
                icon: Mail,
                title: 'E-posta Onayı',
                description: 'Sipariş detaylarını içeren e-posta gönderildi',
              },
              {
                icon: Package,
                title: 'Hazırlanıyor',
                description: 'Siparişiniz 1-2 iş günü içinde hazırlanacak',
              },
              {
                icon: Truck,
                title: 'Kargoya Verilecek',
                description: 'Tahmini teslimat: 3-5 iş günü',
              },
            ].map((step, index) => {
              const Icon = step.icon
              return (
              <div 
                key={index} 
                className="bg-card border border-border p-6 text-center"
              >
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
              <Link href="/">
                Ana Sayfaya Dön
              </Link>
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
