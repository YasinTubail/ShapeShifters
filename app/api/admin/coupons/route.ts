import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function GET() {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(coupons)
}
