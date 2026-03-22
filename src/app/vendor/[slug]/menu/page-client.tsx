'use client'

import { useEffect, useRef, useState } from 'react'
import { MenuItemCard } from '@/components/vendor/MenuItemCard'
import { AllergenBadge } from '@/components/vendor/AllergenBadge'
import { useVendor } from '@/lib/vendor-context'

type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  allergens: string[]
  dietaryTags: string[]
  available: boolean
}

type Category = {
  id: string
  name: string
  items: MenuItem[]
}

type MenuPageClientProps = {
  categories: Category[]
  allAllergens: string[]
  preOrderingEnabled: boolean
}

export function MenuPageClient({ categories, allAllergens, preOrderingEnabled }: MenuPageClientProps) {
  const vendor = useVendor()
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '')
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id)
          }
        }
      },
      { rootMargin: '-100px 0px -60% 0px' }
    )

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [categories])

  const scrollToCategory = (id: string) => {
    const el = sectionRefs.current[id]
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 120
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  if (categories.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">Menu coming soon</p>
          <p className="mt-1 text-sm text-gray-500">Check back later for our full menu.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">Our Menu</h1>

      {/* Category sticky nav */}
      {categories.length > 1 && (
        <div className="sticky top-[65px] z-20 -mx-4 mb-6 overflow-x-auto border-b border-gray-100 bg-white/95 px-4 backdrop-blur-sm">
          <div className="flex gap-1 py-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={
                  activeCategory === cat.id
                    ? { backgroundColor: vendor.primaryColor }
                    : undefined
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu sections */}
      <div className="space-y-10">
        {categories.map((cat) => (
          <section
            key={cat.id}
            id={cat.id}
            ref={(el) => {
              sectionRefs.current[cat.id] = el
            }}
          >
            <h2 className="mb-4 text-lg font-bold text-gray-900 sm:text-xl">
              {cat.name}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {cat.items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  orderingEnabled={preOrderingEnabled}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Allergen legend */}
      {allAllergens.length > 0 && (
        <section className="mt-12 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:p-6">
          <h3 className="mb-3 text-sm font-bold text-gray-700">Allergen Information</h3>
          <div className="flex flex-wrap gap-2">
            {allAllergens.map((a) => (
              <AllergenBadge key={a} allergen={a} />
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-400">
            If you have any food allergies or intolerances, please speak to a member of our team before ordering.
          </p>
        </section>
      )}
    </div>
  )
}
