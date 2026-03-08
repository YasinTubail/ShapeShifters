import { getCollections } from '@/lib/server-products'
import { CollectionsClient } from '@/components/admin/collections-client'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Collections | Admin' }

export default function AdminCollectionsPage() {
  const collections = getCollections()
  return (
    <div className="p-8">
      <CollectionsClient collections={collections} />
    </div>
  )
}
