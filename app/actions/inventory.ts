'use server'

import { revalidatePath } from 'next/cache'
import { getProducts, saveProducts } from '@/lib/server-products'
import { verifyAdminSession } from '@/lib/admin-auth'

export interface StockUpdate {
  productId: string
  variantId: string
  size: string
  stock: number
}

export async function adminBulkUpdateStock(
  updates: StockUpdate[],
): Promise<{ success: boolean; error?: string; updatedCount: number }> {
  if (!(await verifyAdminSession())) {
    return { success: false, error: 'Unauthorized', updatedCount: 0 }
  }

  if (!updates.length) return { success: true, updatedCount: 0 }

  // Reject any negative stock values
  for (const u of updates) {
    if (u.stock < 0) {
      return { success: false, error: 'Stock cannot be negative.', updatedCount: 0 }
    }
  }

  const products = getProducts()
  let updatedCount = 0

  const updated = products.map(product => {
    if (!product.variants?.length) return product
    const productUpdates = updates.filter(u => u.productId === product.id)
    if (!productUpdates.length) return product

    return {
      ...product,
      variants: product.variants.map(variant => {
        const variantUpdates = productUpdates.filter(u => u.variantId === variant.id)
        if (!variantUpdates.length) return variant

        return {
          ...variant,
          sizes: variant.sizes.map(sz => {
            const upd = variantUpdates.find(u => u.size === sz.size)
            if (!upd) return sz
            updatedCount++
            return { ...sz, stock: upd.stock }
          }),
        }
      }),
    }
  })

  try {
    saveProducts(updated)
    revalidatePath('/admin/inventory')
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/products')
    return { success: true, updatedCount }
  } catch {
    return { success: false, error: 'Failed to save (read-only FS on Vercel).', updatedCount: 0 }
  }
}
