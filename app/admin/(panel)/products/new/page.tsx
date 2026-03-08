import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProductForm } from '@/components/admin/product-form'
import { getActiveCollections } from '@/lib/server-products'

export const metadata = { title: 'Add Product | Admin' }

export default function NewProductPage() {
  const collections = getActiveCollections()

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details below to add a new product to your store.</p>
      </div>

      <div className="bg-white border border-gray-100 p-6">
        <ProductForm mode="create" collections={collections} />
      </div>
    </div>
  )
}
