'use server'

import { revalidatePath } from 'next/cache'
import { verifyAdminSession } from '@/lib/admin-auth'
import {
  upsertFulfillment,
  readFulfillments,
  type FulfillmentStatus,
} from '@/lib/server-fulfillments'

export async function adminUpdateFulfillment(data: {
  sessionId: string
  status: FulfillmentStatus
  trackingNumber: string
  trackingCarrier: string
  notes: string
}): Promise<{ success: boolean; error?: string }> {
  if (!(await verifyAdminSession())) return { success: false, error: 'Unauthorized' }

  const validStatuses: FulfillmentStatus[] = ['pending', 'processing', 'shipped', 'delivered']
  if (!validStatuses.includes(data.status)) {
    return { success: false, error: 'Invalid status.' }
  }

  try {
    upsertFulfillment({
      id: data.sessionId,
      status: data.status,
      trackingNumber: data.trackingNumber.trim(),
      trackingCarrier: data.trackingCarrier.trim(),
      notes: data.notes.trim(),
      updatedAt: new Date().toISOString(),
    })
    revalidatePath('/admin/orders')
    revalidatePath('/admin/dashboard')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to save (read-only FS on Vercel).' }
  }
}

export async function adminGetFulfillmentStats() {
  const all = readFulfillments()
  return {
    pending: all.filter(f => f.status === 'pending').length,
    processing: all.filter(f => f.status === 'processing').length,
    shipped: all.filter(f => f.status === 'shipped').length,
    delivered: all.filter(f => f.status === 'delivered').length,
  }
}
