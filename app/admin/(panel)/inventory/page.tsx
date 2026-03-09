import { getProducts } from '@/lib/server-products'
import { InventoryTable } from '@/components/admin/inventory-table'
import { Package } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Inventory | Admin' }

export default function InventoryPage() {
  const products = getProducts()

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6 text-[#53c87a]" />
          Bulk Inventory
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Edit stock levels across all product variants. Click a field to change it, then save.
        </p>
      </div>
      <InventoryTable products={products} />
    </div>
  )
}
