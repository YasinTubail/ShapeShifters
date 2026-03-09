import { Tag } from 'lucide-react'
import { db } from '@/lib/db'
import { CouponForm }  from '@/components/admin/coupon-form'
import { CouponTable } from '@/components/admin/coupon-table'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Coupons | Admin' }

export default async function CouponsPage() {
  // Fetch all coupons ordered newest-first
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Tag className="h-6 w-6 text-[#53c87a]" />
          Discount Coupons
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create and manage discount codes. Toggle the kill-switch to instantly disable any code.
        </p>
      </div>

      {/* Phase 2: Create form */}
      <CouponForm />

      {/* Phase 3: Management table */}
      <div className="mt-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">
          All Coupons ({coupons.length})
        </h2>
        <CouponTable coupons={coupons} />
      </div>
    </div>
  )
}
