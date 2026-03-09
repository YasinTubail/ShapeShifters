import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { readCoupons } from '@/lib/server-coupons'

export async function GET() {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(readCoupons())
}
