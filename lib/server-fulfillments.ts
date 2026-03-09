import 'server-only'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FulfillmentStatus = 'pending' | 'processing' | 'shipped' | 'delivered'

export interface OrderFulfillment {
  id: string              // Stripe checkout session ID
  status: FulfillmentStatus
  trackingNumber: string
  trackingCarrier: string
  notes: string
  updatedAt: string
}

export interface FulfillmentStats {
  pending: number
  processing: number
  shipped: number
  delivered: number
}

// ─── Persistence ──────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), 'data', 'order-fulfillments.json')

export function readFulfillments(): OrderFulfillment[] {
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8')) as OrderFulfillment[]
  } catch {
    return []
  }
}

export function writeFulfillments(fulfillments: OrderFulfillment[]): void {
  writeFileSync(DATA_FILE, JSON.stringify(fulfillments, null, 2), 'utf-8')
}

export function getFulfillment(sessionId: string): OrderFulfillment | undefined {
  return readFulfillments().find(f => f.id === sessionId)
}

export function upsertFulfillment(data: OrderFulfillment): void {
  const all = readFulfillments()
  const idx = all.findIndex(f => f.id === data.id)
  if (idx >= 0) {
    all[idx] = data
  } else {
    all.push(data)
  }
  writeFulfillments(all)
}

export function getFulfillmentStats(fulfillments: OrderFulfillment[]): FulfillmentStats {
  return {
    pending: fulfillments.filter(f => f.status === 'pending').length,
    processing: fulfillments.filter(f => f.status === 'processing').length,
    shipped: fulfillments.filter(f => f.status === 'shipped').length,
    delivered: fulfillments.filter(f => f.status === 'delivered').length,
  }
}
