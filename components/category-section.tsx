import Link from 'next/link'
import Image from 'next/image'

const categories = [
  {
    name: 'Tops',
    image: '/images/categories/tops.jpg',
    href: '/shop?category=Tees',
    count: 3
  },
  {
    name: 'Hoodies',
    image: '/images/categories/outerwear.jpg',
    href: '/shop?category=Hoodies',
    count: 4
  },
  {
    name: 'Bottoms',
    image: '/images/categories/bottoms.jpg',
    href: '/shop?category=Bottoms',
    count: 3
  },
  {
    name: 'Accessories',
    image: '/images/categories/accessories.jpg',
    href: '/shop?category=Accessories',
    count: 2
  },
]

export function CategorySection() {
  return (
    <section className="py-20 bg-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-2">
            Categories
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Shop by Style
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative aspect-[3/4] overflow-hidden bg-primary"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-lg font-bold text-primary-foreground mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-accent">
                  {category.count} pieces
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
