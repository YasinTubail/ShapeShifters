'use client'

import { useCallback, useState } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Loader2, AlertCircle } from 'lucide-react'

import { startCheckoutSession } from '@/app/actions/stripe'

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  selectedSize: string
}

export default function Checkout({
  cartItems,
  couponCode,
}: {
  cartItems: CartItem[]
  couponCode?: string
}) {
  const [error, setError] = useState<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    try {
      setError(null)
      const clientSecret = await startCheckoutSession(cartItems, couponCode)
      if (!clientSecret) {
        throw new Error('Failed to create checkout session')
      }
      return clientSecret
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      throw err
    }
  }, [cartItems, couponCode])

  if (!stripePromise) {
    return (
      <div className="bg-muted/50 border border-border p-6 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-bold mb-2">Checkout Not Configured</h3>
        <p className="text-sm text-muted-foreground">
          Add <code className="bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to your environment variables to enable checkout.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 p-6 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
        <h3 className="font-bold text-destructive mb-2">Checkout Error</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => setError(null)}
          className="bg-primary text-primary-foreground px-6 py-2 font-medium hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <div className="min-h-[300px] sm:min-h-[400px]">
          <EmbeddedCheckout />
        </div>
      </EmbeddedCheckoutProvider>
    </div>
  )
}
