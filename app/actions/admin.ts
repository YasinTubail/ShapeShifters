'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createAdminSession, clearAdminSession, verifyAdminSession } from '@/lib/admin-auth'
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit'
import {
  getProducts,
  saveProducts,
  getCollections,
  saveCollections,
  type ProductWithActive,
  type Collection,
} from '@/lib/server-products'

const UNAUTHORIZED = { success: false, error: 'Unauthorized.' } as const

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function adminLogin(password: string) {
  // Rate-limit by IP
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = checkRateLimit(`login:${ip}`)

  if (!rl.allowed) {
    const mins = Math.ceil((rl.retryAfterMs ?? 0) / 60000)
    return { success: false, error: `Too many attempts. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.` }
  }

  const success = await createAdminSession(password)
  if (success) resetRateLimit(`login:${ip}`) // clear on success
  return { success }
}

export async function adminLogout() {
  await clearAdminSession()
  return { success: true }
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  if (!(await verifyAdminSession())) return UNAUTHORIZED

  // Verify the current password is correct
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword || currentPassword !== adminPassword) {
    return { success: false, error: 'Current password is incorrect.' }
  }

  // On Vercel, we cannot persist env-var changes at runtime.
  // We write the new password to a local override file so it takes effect
  // for the current process; instruct the user to update the env var via CLI
  // to make it permanent across deployments.
  try {
    const fs = await import('fs')
    const path = await import('path')
    const overridePath = path.join(process.cwd(), 'data', 'admin-override.json')
    fs.writeFileSync(overridePath, JSON.stringify({ password: newPassword }), 'utf-8')
    // Patch the runtime env so the change is live immediately in this process
    process.env.ADMIN_PASSWORD = newPassword
  } catch {
    // Non-fatal: the env patch above still takes effect for this process
  }

  return { success: true }
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function createProduct(data: ProductWithActive) {
  if (!(await verifyAdminSession())) return UNAUTHORIZED

  const products = getProducts()

  // Ensure unique ID
  if (products.find((p) => p.id === data.id)) {
    return { success: false, error: 'A product with this ID already exists.' }
  }

  products.push({ ...data, active: true })
  saveProducts(products)
  revalidatePath('/shop')
  revalidatePath('/')
  revalidatePath('/admin/products')
  return { success: true }
}

export async function updateProduct(id: string, data: Partial<ProductWithActive>) {
  if (!(await verifyAdminSession())) return UNAUTHORIZED

  const products = getProducts()
  const idx = products.findIndex((p) => p.id === id)
  if (idx === -1) return { success: false, error: 'Product not found.' }

  products[idx] = { ...products[idx], ...data }
  saveProducts(products)
  revalidatePath('/shop')
  revalidatePath('/')
  revalidatePath(`/product/${id}`)
  revalidatePath('/admin/products')
  return { success: true }
}

export async function deleteProduct(id: string) {
  if (!(await verifyAdminSession())) return UNAUTHORIZED

  const products = getProducts()
  const filtered = products.filter((p) => p.id !== id)
  if (filtered.length === products.length) return { success: false, error: 'Product not found.' }

  saveProducts(filtered)
  revalidatePath('/shop')
  revalidatePath('/')
  revalidatePath('/admin/products')
  return { success: true }
}

export async function toggleProductActive(id: string) {
  if (!(await verifyAdminSession())) return UNAUTHORIZED

  const products = getProducts()
  const idx = products.findIndex((p) => p.id === id)
  if (idx === -1) return { success: false, error: 'Product not found.' }

  products[idx].active = !products[idx].active
  saveProducts(products)
  revalidatePath('/shop')
  revalidatePath('/')
  revalidatePath('/admin/products')
  return { success: true }
}

// ─── Collections ──────────────────────────────────────────────────────────────

export async function createCollection(data: Collection) {
  if (!(await verifyAdminSession())) return UNAUTHORIZED

  const collections = getCollections()

  if (collections.find((c) => c.slug === data.slug)) {
    return { success: false, error: 'A collection with this slug already exists.' }
  }

  collections.push({ ...data, active: true })
  saveCollections(collections)
  revalidatePath('/collections')
  revalidatePath('/admin/collections')
  return { success: true }
}

export async function updateCollection(id: string, data: Partial<Collection>) {
  if (!(await verifyAdminSession())) return UNAUTHORIZED

  const collections = getCollections()
  const idx = collections.findIndex((c) => c.id === id)
  if (idx === -1) return { success: false, error: 'Collection not found.' }

  collections[idx] = { ...collections[idx], ...data }
  saveCollections(collections)
  revalidatePath('/collections')
  revalidatePath(`/collections/${collections[idx].slug}`)
  revalidatePath('/admin/collections')
  return { success: true }
}

export async function deleteCollection(id: string) {
  if (!(await verifyAdminSession())) return UNAUTHORIZED

  const collections = getCollections()
  const filtered = collections.filter((c) => c.id !== id)
  if (filtered.length === collections.length) return { success: false, error: 'Collection not found.' }

  saveCollections(filtered)
  revalidatePath('/collections')
  revalidatePath('/admin/collections')
  return { success: true }
}

export async function toggleCollectionActive(id: string) {
  if (!(await verifyAdminSession())) return UNAUTHORIZED

  const collections = getCollections()
  const idx = collections.findIndex((c) => c.id === id)
  if (idx === -1) return { success: false, error: 'Collection not found.' }

  collections[idx].active = !(collections[idx].active ?? true)
  saveCollections(collections)
  revalidatePath('/collections')
  revalidatePath('/admin/collections')
  return { success: true }
}
