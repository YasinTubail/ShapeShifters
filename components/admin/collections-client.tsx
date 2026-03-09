"use client"

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from 'lucide-react'
import { createCollection, updateCollection, deleteCollection, toggleCollectionActive } from '@/app/actions/admin'
import type { Collection } from '@/lib/server-products'

interface CollectionsClientProps {
  collections: Collection[]
}

export function CollectionsClient({ collections }: CollectionsClientProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const empty = { id: '', name: '', slug: '', description: '', image: '', featured: false }
  const [form, setFormState] = useState(empty)

  function openCreate() {
    setFormState(empty)
    setEditingId(null)
    setShowForm(true)
    setError('')
  }

  function openEdit(c: Collection) {
    setFormState({ id: c.id, name: c.name, slug: c.slug, description: c.description, image: c.image, featured: c.featured ?? false })
    setEditingId(c.id)
    setShowForm(true)
    setError('')
  }

  function set(key: string, value: string | boolean) {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const data: Collection = {
      id: editingId ?? form.slug.toLowerCase().replace(/\s+/g, '-'),
      name: form.name,
      slug: form.slug.toLowerCase().replace(/\s+/g, '-'),
      description: form.description,
      image: form.image,
      featured: form.featured,
      active: true,
    }

    const result = editingId
      ? await updateCollection(editingId, data)
      : await createCollection(data)

    if (result.success) {
      setShowForm(false)
      router.refresh()
    } else {
      setError(result.error ?? 'Something went wrong.')
      setLoading(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const result = await deleteCollection(id)
    if (result.success) router.refresh()
  }

  async function handleToggle(id: string) {
    await toggleCollectionActive(id)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
          <p className="text-gray-500 text-sm mt-1">{collections.length} collections</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-[#01301e] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#0b6e4f] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Collection
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{editingId ? 'Edit Collection' : 'New Collection'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} required
                placeholder="e.g. Summer 2026"
                className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input value={form.slug} onChange={(e) => set('slug', e.target.value)} required
                placeholder="e.g. summer-2026"
                disabled={!!editingId}
                className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e] disabled:bg-gray-50 disabled:text-gray-400" />
              <p className="text-xs text-gray-400 mt-1">Used in the URL. Cannot be changed after creation.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2}
                placeholder="Describe this collection..."
                className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e] resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image Path *</label>
              <input value={form.image} onChange={(e) => set('image', e.target.value)} required
                placeholder="/images/collections/summer-2026.jpg"
                className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e]" />
              <p className="text-xs text-gray-400 mt-1">Upload the image to <code>public/images/</code> first.</p>
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="featured" checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="w-4 h-4 accent-[#01301e]" />
              <label htmlFor="featured" className="text-sm text-gray-700">Mark as Featured Collection</label>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={loading}
                className="bg-[#01301e] text-white px-5 py-2 text-sm font-medium hover:bg-[#0b6e4f] transition-colors disabled:opacity-50">
                {loading ? 'Saving...' : editingId ? 'Save Changes' : 'Create Collection'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2 text-sm border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((c) => (
          <div key={c.id} className="bg-white border border-gray-100 overflow-hidden">
            <div className="relative aspect-[3/2] bg-gray-100">
              <Image src={c.image} alt={c.name} fill className="object-cover" />
              {c.featured && (
                <span className="absolute top-2 left-2 bg-[#53c87a] text-[#01301e] text-xs font-bold px-2 py-0.5">
                  FEATURED
                </span>
              )}
              {c.active === false && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white/90 text-gray-700 text-xs font-bold px-3 py-1">HIDDEN</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{c.name}</h3>
                <span className="text-xs text-gray-400 shrink-0">/{c.slug}</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{c.description}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => handleToggle(c.id)}
                  title={c.active !== false ? 'Hide collection' : 'Show collection'}
                  className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
                  {c.active !== false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button onClick={() => openEdit(c)}
                  title="Edit collection"
                  className="p-1.5 text-gray-400 hover:text-[#01301e] transition-colors">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(c.id, c.name)}
                  title="Delete collection"
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
