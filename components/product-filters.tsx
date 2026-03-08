"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, X } from 'lucide-react'
import { useState } from 'react'
import type { Collection } from '@/lib/server-products'

const categories = ['All', 'Hoodies', 'Tees', 'Bottoms', 'Accessories']
const colors = ['All', 'Black', 'White', 'Forest', 'Emerald']
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', 'One Size']

interface ProductFiltersProps {
  collections: Collection[]
}

export function ProductFilters({ collections }: ProductFiltersProps) {
  const collectionOptions = ['All', ...collections.map(c => c.name)]
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentCategory = searchParams.get('category') || 'All'
  const currentColor = searchParams.get('color') || 'All'
  const currentSize = searchParams.get('size') || ''
  const currentSort = searchParams.get('sort') || 'newest'
  const currentCollection = searchParams.get('collection') || 'All'

  const [openFilter, setOpenFilter] = useState<string | null>(null)

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'All' || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/shop?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/shop')
  }

  const hasActiveFilters = currentCategory !== 'All' || currentColor !== 'All' || currentSize !== '' || currentCollection !== 'All'

  const FilterDropdown = ({ 
    label, 
    options, 
    currentValue, 
    filterKey 
  }: { 
    label: string
    options: string[]
    currentValue: string
    filterKey: string 
  }) => {
    const isOpen = openFilter === filterKey

    return (
      <div className="relative">
        <button
          onClick={() => setOpenFilter(isOpen ? null : filterKey)}
          className="flex items-center gap-2 text-sm font-medium tracking-wide hover:text-accent transition-colors uppercase"
        >
          {label}: <span className="text-muted-foreground normal-case">{currentValue || 'All'}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setOpenFilter(null)}
            />
            <div className="absolute top-full left-0 mt-2 bg-card border border-border shadow-lg z-20 min-w-[160px]">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    updateFilter(filterKey, option)
                    setOpenFilter(null)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary hover:text-accent transition-colors ${
                    currentValue === option ? 'bg-secondary font-medium text-accent' : ''
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="border-b border-border py-4 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <FilterDropdown
            label="Collection"
            options={collectionOptions}
            currentValue={currentCollection}
            filterKey="collection"
          />
          <FilterDropdown
            label="Category"
            options={categories}
            currentValue={currentCategory}
            filterKey="category"
          />
          <FilterDropdown
            label="Color"
            options={colors}
            currentValue={currentColor}
            filterKey="color"
          />
          <div className="relative">
            <button
              onClick={() => setOpenFilter(openFilter === 'size' ? null : 'size')}
              className="flex items-center gap-2 text-sm font-medium tracking-wide hover:text-accent transition-colors uppercase"
            >
              Size: <span className="text-muted-foreground normal-case">{currentSize || 'All'}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${openFilter === 'size' ? 'rotate-180' : ''}`} />
            </button>
            
            {openFilter === 'size' && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setOpenFilter(null)}
                />
                <div className="absolute top-full left-0 mt-2 bg-card border border-border shadow-lg z-20 min-w-[120px]">
                  <button
                    onClick={() => {
                      updateFilter('size', '')
                      setOpenFilter(null)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary hover:text-accent transition-colors ${
                      currentSize === '' ? 'bg-secondary font-medium text-accent' : ''
                    }`}
                  >
                    All
                  </button>
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        updateFilter('size', size)
                        setOpenFilter(null)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary hover:text-accent transition-colors ${
                        currentSize === size ? 'bg-secondary font-medium text-accent' : ''
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-destructive hover:text-destructive/80 transition-colors font-medium"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setOpenFilter(openFilter === 'sort' ? null : 'sort')}
            className="flex items-center gap-2 text-sm font-medium tracking-wide hover:text-accent transition-colors uppercase"
          >
            Sort: <span className="text-muted-foreground normal-case">{currentSort === 'newest' ? 'Newest' : currentSort === 'price-low' ? 'Price: Low to High' : 'Price: High to Low'}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${openFilter === 'sort' ? 'rotate-180' : ''}`} />
          </button>
          
          {openFilter === 'sort' && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setOpenFilter(null)}
              />
              <div className="absolute top-full right-0 mt-2 bg-card border border-border shadow-lg z-20 min-w-[180px]">
                {[
                  { value: 'newest', label: 'Newest' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      updateFilter('sort', option.value)
                      setOpenFilter(null)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary hover:text-accent transition-colors ${
                      currentSort === option.value ? 'bg-secondary font-medium text-accent' : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
