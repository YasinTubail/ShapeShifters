'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import {
  createAdminSession,
  clearAdminSession,
  verifyAdminSession,
  getCurrentUser,
  hashPassword,
  bootstrapIfEmpty,
} from '@/lib/admin-auth'
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit'
import {
  readAdminUsers,
  writeAdminUsers,
  readResetTokens,
  writeResetTokens,
  type AdminRole,
} from '@/lib/admin-users'
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

export async function adminLogin(username: string, password: string) {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = checkRateLimit(`login:${ip}`)

  if (!rl.allowed) {
    const mins = Math.ceil((rl.retryAfterMs ?? 0) / 60000)
    return { success: false, error: `Too many attempts. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.` }
  }

  const success = await createAdminSession(username, password)
  if (success) resetRateLimit(`login:${ip}`)
  return { success }
}

export async function adminLogout() {
  await clearAdminSession()
  return { success: true }
}

// ─── Password change (self) ────────────────────────────────────────────────────

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  const user = await getCurrentUser()
  if (!user) return UNAUTHORIZED

  const currentHash = await hashPassword(currentPassword)
  if (currentHash !== user.passwordHash) {
    return { success: false, error: 'Current password is incorrect.' }
  }

  const newHash = await hashPassword(newPassword)
  const users = readAdminUsers()
  const updated = users.map(u => u.id === user.id ? { ...u, passwordHash: newHash } : u)
  writeAdminUsers(updated)

  return { success: true }
}

// ─── Forgot / Reset password ───────────────────────────────────────────────────

export async function requestPasswordReset(email: string) {
  const users = await bootstrapIfEmpty()
  const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase() && u.active)
  // Always return success to prevent user enumeration
  if (!user) return { success: true }

  // Generate a secure token
  const tokenBytes = new Uint8Array(32)
  crypto.getRandomValues(tokenBytes)
  const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('')

  // Store token (valid 1 hour)
  const tokens = readResetTokens().filter(t => !t.used && new Date(t.expiresAt) > new Date())
  tokens.push({
    token,
    userId: user.id,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    used: false,
  })
  writeResetTokens(tokens)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const resetUrl = `${baseUrl}/admin/reset-password?token=${token}`

  // Send email via Resend
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'SHAPESHIFTERS Admin <noreply@sshifters.com>',
        to: user.email,
        subject: 'Reset your admin password',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
            <h1 style="color:#01301e;font-size:24px;">Reset your password</h1>
            <p style="color:#555;">Hi ${user.username}, click the button below to reset your SHAPESHIFTERS admin password. This link expires in 1 hour.</p>
            <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:14px 32px;background:#01301e;color:#fff;text-decoration:none;font-weight:600;border-radius:4px;">Reset Password</a>
            <p style="color:#888;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      }),
    })
  }

  return { success: true }
}

export async function resetPassword(token: string, newPassword: string) {
  const tokens = readResetTokens()
  const resetToken = tokens.find(t => t.token === token && !t.used && new Date(t.expiresAt) > new Date())
  if (!resetToken) return { success: false, error: 'Invalid or expired reset link.' }

  const users = readAdminUsers()
  const userIdx = users.findIndex(u => u.id === resetToken.userId)
  if (userIdx === -1) return { success: false, error: 'User not found.' }

  const passwordHash = await hashPassword(newPassword)
  users[userIdx].passwordHash = passwordHash
  writeAdminUsers(users)

  // Mark token as used
  writeResetTokens(tokens.map(t => t.token === token ? { ...t, used: true } : t))

  return { success: true }
}

// ─── User management (owner only) ─────────────────────────────────────────────

export async function createAdminUser(username: string, email: string, password: string, role: AdminRole) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'owner') return UNAUTHORIZED

  const users = readAdminUsers()
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, error: 'Username already exists.' }
  }
  if (email && users.find(u => u.email?.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'Email already in use.' }
  }

  const passwordHash = await hashPassword(password)
  const newUser = {
    id: crypto.randomUUID(),
    username,
    email,
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    active: true,
  }
  writeAdminUsers([...users, newUser])
  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateAdminUserRole(userId: string, role: AdminRole) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'owner') return UNAUTHORIZED
  if (currentUser.id === userId) return { success: false, error: 'You cannot change your own role.' }

  const users = readAdminUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return { success: false, error: 'User not found.' }

  users[idx].role = role
  writeAdminUsers(users)
  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateAdminUserEmail(userId: string, email: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return UNAUTHORIZED
  // Can update own email, or owner can update anyone
  if (currentUser.id !== userId && currentUser.role !== 'owner') return UNAUTHORIZED

  const users = readAdminUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return { success: false, error: 'User not found.' }

  users[idx].email = email
  writeAdminUsers(users)
  revalidatePath('/admin/users')
  return { success: true }
}

export async function resetAdminUserPassword(userId: string, newPassword: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'owner') return UNAUTHORIZED

  const users = readAdminUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return { success: false, error: 'User not found.' }

  users[idx].passwordHash = await hashPassword(newPassword)
  writeAdminUsers(users)
  return { success: true }
}

export async function deleteAdminUser(userId: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'owner') return UNAUTHORIZED
  if (currentUser.id === userId) return { success: false, error: 'You cannot delete your own account.' }

  const users = readAdminUsers()
  // Ensure at least one owner remains
  const owners = users.filter(u => u.role === 'owner' && u.id !== userId)
  const targetUser = users.find(u => u.id === userId)
  if (targetUser?.role === 'owner' && owners.length === 0) {
    return { success: false, error: 'Cannot delete the last owner account.' }
  }

  writeAdminUsers(users.filter(u => u.id !== userId))
  revalidatePath('/admin/users')
  return { success: true }
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function createProduct(data: ProductWithActive) {
  if (!(await verifyAdminSession())) return UNAUTHORIZED

  const products = getProducts()

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
