"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

// ─── Variant types (exported — used by admin form + storefront) ───────────────

export interface VariantSize {
  size: string
  /** -1 = unknown/not tracked (legacy products), 0 = out of stock, >0 = units available */
  stock: number
  sku: string
}

export interface ProductVariant {
  id: string
  color: string
  colorHex: string
  /** Ordered list of image paths. Index 0 is the primary/hero image for this color. */
  images: string[]
  sizes: VariantSize[]
}

// ─── Product type ─────────────────────────────────────────────────────────────

export interface Product {
  id: string
  name: string
  price: number
  /** Legacy primary image (kept for backwards-compat; mirrors first variant's first image) */
  image: string
  category: string
  /** Legacy color label (kept for backwards-compat; mirrors first variant's color) */
  color: string
  /** Legacy size list (kept for backwards-compat; union of all variant sizes) */
  size: string[]
  description: string
  material?: string
  collection?: string
  images?: string[]
  /** When present, supersedes the legacy color / size / image fields on the storefront */
  variants?: ProductVariant[]
}

// ─── Cart types ───────────────────────────────────────────────────────────────

export interface CartItem extends Product {
  quantity: number
  selectedSize: string
  /** Which color variant was selected — used to deduplicate same product + size in different colors */
  selectedColor?: string
}

// ─── Cart context ─────────────────────────────────────────────────────────────

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, size: string, selectedColor?: string) => void
  removeItem: (id: string, size: string, selectedColor?: string) => void
  updateQuantity: (id: string, size: string, quantity: number, selectedColor?: string) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  isLoaded: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'shapeshifters-cart'

/** Stable key for a cart line: product id + selected size + selected color */
function lineKey(id: string, size: string, color?: string) {
  return `${id}|${size}|${color ?? ''}`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart)) setItems(parsedCart)
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error)
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error)
      }
    }
  }, [items, isLoaded])

  const addItem = useCallback((product: Product, size: string, selectedColor?: string) => {
    setItems((prev) => {
      const key = lineKey(product.id, size, selectedColor)
      const existing = prev.find(
        (item) => lineKey(item.id, item.selectedSize, item.selectedColor) === key
      )
      if (existing) {
        return prev.map((item) =>
          lineKey(item.id, item.selectedSize, item.selectedColor) === key
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size, selectedColor }]
    })
    setIsCartOpen(true)
  }, [])

  const removeItem = useCallback((id: string, size: string, selectedColor?: string) => {
    const key = lineKey(id, size, selectedColor)
    setItems((prev) =>
      prev.filter((item) => lineKey(item.id, item.selectedSize, item.selectedColor) !== key)
    )
  }, [])

  const updateQuantity = useCallback(
    (id: string, size: string, quantity: number, selectedColor?: string) => {
      if (quantity <= 0) {
        removeItem(id, size, selectedColor)
        return
      }
      const key = lineKey(id, size, selectedColor)
      setItems((prev) =>
        prev.map((item) =>
          lineKey(item.id, item.selectedSize, item.selectedColor) === key
            ? { ...item, quantity }
            : item
        )
      )
    },
    [removeItem]
  )

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
