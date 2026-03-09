"use client"

import Link from 'next/link'
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { toggleProductActive, deleteProduct } from '@/app/actions/admin'

interface ProductRowActionsProps {
  id: string
  name: string
  active: boolean
}

export function ProductRowActions({ id, name, active }: ProductRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      {/* Wrap in void arrow to satisfy TypeScript form action typing */}
      <form action={async () => { await toggleProductActive(id) }}>
        <button
          type="submit"
          title={active ? 'Hide product' : 'Show product'}
          className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
        >
          {active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </form>
      <Link
        href={`/admin/products/${id}`}
        className="p-1.5 text-gray-400 hover:text-[#01301e] transition-colors"
        title="Edit product"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <form action={async () => { await deleteProduct(id) }}>
        <button
          type="submit"
          title="Delete product"
          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
          onClick={(e) => {
            if (!confirm(`Delete "${name}"? This cannot be undone.`)) {
              e.preventDefault()
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
