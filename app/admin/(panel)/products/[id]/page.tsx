import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/admin/product-form'
import { getProductById, getActiveCollections } from '@/lib/server-products'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = getProductById(id)
  if (!product) notFound()

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
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-500 text-sm mt-1">Editing: <span className="font-medium text-gray-700">{product.name}</span></p>
      </div>

      <div className="bg-white border border-gray-100 p-6">
        <ProductForm mode="edit" product={product} collections={collections} />
      </div>
    </div>
  )
}
