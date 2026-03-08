import 'server-only'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { Product } from './cart-context'

export interface Collection {
  id: string
  name: string
  slug: string
  description: string
  image: string
  featured?: boolean
  active?: boolean
}

export interface ProductWithActive extends Product {
  active?: boolean
}

const DATA_DIR = join(process.cwd(), 'data')

export function getProducts(): ProductWithActive[] {
  try {
    const data = readFileSync(join(DATA_DIR, 'products.json'), 'utf-8')
    return JSON.parse(data)
  } catch {
    // Fallback to static data if JSON not found
    return []
  }
}

export function getActiveProducts(): Product[] {
  return getProducts().filter((p) => p.active !== false)
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id)
}

export function getProductsByCollection(collectionSlug: string): Product[] {
  return getActiveProducts().filter((p) => p.collection === collectionSlug)
}

export function saveProducts(products: ProductWithActive[]): void {
  writeFileSync(join(DATA_DIR, 'products.json'), JSON.stringify(products, null, 2))
}

export function getCollections(): Collection[] {
  try {
    const data = readFileSync(join(DATA_DIR, 'collections.json'), 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function getActiveCollections(): Collection[] {
  return getCollections().filter((c) => c.active !== false)
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return getCollections().find((c) => c.slug === slug)
}

export function saveCollections(collections: Collection[]): void {
  writeFileSync(join(DATA_DIR, 'collections.json'), JSON.stringify(collections, null, 2))
}

export const categories = ['All', 'Hoodies', 'Tees', 'Bottoms', 'Accessories']
export const colors = ['All', 'Black', 'White', 'Forest', 'Emerald']
export const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', 'One Size']
